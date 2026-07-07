import htppStatus from "http-status";
import type { Prisma } from "../../../generated/prisma/client";
import type { PropertyWhereInput } from "../../../generated/prisma/models";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  createPropertyPayload,
  TGetAllPropertiesQuery,
  updatePropertyPayload,
} from "./property.interface";

class PropertyService {
  getAllProperties = async (query: TGetAllPropertiesQuery) => {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortBy,
      sortOrder,
      landlordId,
      amenity,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      city,
      division,
      category,
    } = query;

    const pageNumber = Math.max(1, Number(page));
    const take = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * take;
    const where: PropertyWhereInput = { isAvailable: true };

    // Search
    if (searchTerm) {
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          division: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filter
    if (landlordId) {
      where.landlordId = landlordId;
    }

    if (city) {
      where.city = {
        equals: city,
        mode: "insensitive",
      };
    }

    if (division) {
      where.division = {
        equals: division,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = {
        name: {
          equals: category,
          mode: "insensitive",
        },
      };
    }

    // amenity filtering
    // if (amenity?.length) {
    //   where.propertyAmenities = {
    //     some: {
    //       amenity: {
    //         name: {
    //           in: amenity,
    //           mode: "insensitive",
    //         },
    //       },
    //     },
    //   };
    // }

    // price range
    if (minPrice || maxPrice) {
      where.rentPrice = {
        ...(minPrice && {
          gte: Number(minPrice),
        }),
        ...(maxPrice && {
          lte: Number(maxPrice),
        }),
      };
    }

    // date range
    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate && {
          gte: new Date(fromDate),
        }),
        ...(toDate && {
          lte: new Date(toDate),
        }),
      };
    }

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        take,
        skip,
        orderBy: {
          [sortBy!]: sortOrder,
        },
      }),
    ]);

    return {
      properties,
      pagination: {
        total,
        pageNumber,
        limit: take,
        totalPage: Math.ceil(total / take),
      },
    };
  };

  createProperty = async (
    landlordId: string,
    payload: createPropertyPayload,
  ) => {
    const { amenityIds, ...propertyPayload } = payload;
    // Validate category
    const categoryExists = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!categoryExists) {
      throw new AppError(
        htppStatus.NOT_FOUND,
        "Category is not found. Please provide valid category id.",
      );
    }

    // Validate amenities
    if (amenityIds && amenityIds?.length > 0) {
      const amenities = await prisma.amenity.findMany({
        where: {
          id: {
            in: amenityIds,
          },
        },
      });

      if (amenities.length !== amenityIds.length) {
        throw new AppError(
          htppStatus.BAD_REQUEST,
          "One or more amenity ids are invalid.",
        );
      }
    }

    const property = await prisma.$transaction(async (tx) => {
      const createdProperty = await tx.property.create({
        data: {
          landlordId,
          ...propertyPayload,
          description: propertyPayload.description ?? null,
          area: propertyPayload.area ?? null,
        },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (amenityIds && amenityIds?.length > 0) {
        await tx.propertyAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            propertyId: createdProperty.id,
            amenityId,
          })),
        });
      }
      return createdProperty;
    });

    return property;
  };

  updateProperty = async (
    id: string,
    landlordId: string,
    payload: updatePropertyPayload,
  ) => {
    const {
      address,
      area,
      bathrooms,
      bedrooms,
      categoryId,
      city,
      description,
      division,
      rentPrice,
      title,
      amenityIds,
      // ...propertyPayload
    } = payload;

    // Check property exists
    const existsProperty = await prisma.property.findUnique({
      where: {
        id,
      },
    });

    if (!existsProperty) {
      throw new AppError(
        htppStatus.NOT_FOUND,
        "Property not found. please provide valid id.",
      );
    }

    // Ensure the landlord owns the property
    if (existsProperty.landlordId !== landlordId) {
      throw new AppError(
        htppStatus.FORBIDDEN,
        "You are not authorized to update this property.",
      );
    }

    // Validate category if updating
    if (payload.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: payload.categoryId,
        },
      });

      if (!category) {
        throw new AppError(htppStatus.NOT_FOUND, "Category not found.");
      }
    }

    // Validate amenities
    if (amenityIds) {
      const amenities = await prisma.amenity.findMany({
        where: {
          id: {
            in: amenityIds,
          },
        },
      });

      if (amenities.length !== amenityIds.length) {
        throw new AppError(
          htppStatus.BAD_REQUEST,
          "One or more amenity ids are invalid.",
        );
      }
    }

    const data: Prisma.PropertyUpdateInput = {
      ...(title && { title }),
      ...(description && { description }),
      ...(address && { address }),
      ...(city && { city }),
      ...(division && { division }),
      ...(rentPrice && { rentPrice }),
      ...(area && { area }),
      ...(bedrooms && { bedrooms }),
      ...(bathrooms && { bathrooms }),
      ...(categoryId && {
        category: {
          connect: {
            id: categoryId,
          },
        },
      }),
    };

    const updatePropertyTransaction = await prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: {
          id,
        },
        data,
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (amenityIds) {
        await tx.propertyAmenity.deleteMany({
          where: {
            propertyId: id,
          },
        });
      }

      if (amenityIds && amenityIds?.length > 0) {
        await tx.propertyAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            propertyId: id,
            amenityId,
          })),
        });
      }

      return property;
    });

    return updatePropertyTransaction;
  };

  deleteProperty = async (landlordId: string, id: string) => {
    // check property exists
    const existsProperty = await prisma.property.findUnique({
      where: {
        id,
      },
    });

    if (!existsProperty) {
      throw new AppError(
        htppStatus.NOT_FOUND,
        "Property not found. Please provide a valid property id.",
      );
    }
    // ownership validation
    if (existsProperty.landlordId !== landlordId) {
      throw new AppError(
        htppStatus.FORBIDDEN,
        "You are not authorized to delete this property.",
      );
    }

    await prisma.property.delete({
      where: {
        id,
      },
    });
    return null;
  };
}

export const propertyService = new PropertyService();
