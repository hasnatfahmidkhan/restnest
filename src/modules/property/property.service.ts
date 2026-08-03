import httpStatus from "http-status";
import { type Prisma } from "../../../generated/prisma/client";
import type { PropertyWhereInput } from "../../../generated/prisma/models";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import {
  type createPropertyPayload,
  type TGetAllPropertiesQuery,
  type updatePropertyPayload,
} from "./property.interface";

class PropertyService {
  private validateImages(
    images?: { url: string; isPrimary?: boolean | undefined }[],
  ) {
    if (!images) return;

    const normalizedImages = images.map((image, index) => ({
      url: image.url,
      isPrimary: image.isPrimary ?? index === 0,
    }));

    const uniqueUrls = new Set(normalizedImages.map((img) => img.url));

    if (uniqueUrls.size !== normalizedImages.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Duplicate image urls are not allowed.",
      );
    }

    const primaryCount = normalizedImages.filter((img) => img.isPrimary).length;

    if (primaryCount > 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only one primary image is allowed.",
      );
    }

    return normalizedImages;
  }

  private async validateRelations(categoryId?: string, amenityIds?: string[]) {
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found.");
      }
    }

    if (amenityIds?.length) {
      const uniqueAmenityIds = [...new Set(amenityIds)];

      const amenities = await prisma.amenity.findMany({
        where: {
          id: {
            in: uniqueAmenityIds,
          },
        },
      });

      if (amenities.length !== uniqueAmenityIds.length) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "One or more amenity ids are invalid.",
        );
      }

      return uniqueAmenityIds;
    }

    return [];
  }

  private async syncPropertyRelations(
    tx: Prisma.TransactionClient,
    propertyId: string,
    amenityIds: string[],
    images?: {
      url: string;
      isPrimary: boolean;
    }[],
  ) {
    // Amenities

    await tx.propertyAmenity.deleteMany({
      where: {
        propertyId,
      },
    });

    if (amenityIds.length) {
      await tx.propertyAmenity.createMany({
        data: amenityIds.map((amenityId) => ({
          propertyId,
          amenityId,
        })),
      });
    }

    // Images

    if (images) {
      await tx.propertyImage.deleteMany({
        where: {
          propertyId,
        },
      });

      await tx.propertyImage.createMany({
        data: images.map((image) => ({
          propertyId,
          url: image.url,
          isPrimary: image.isPrimary,
        })),
      });
    }
  }

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
    if (amenity?.length) {
      where.propertyAmenities = {
        some: {
          amenity: {
            name: {
              in: amenity,
              mode: "insensitive",
            },
          },
        },
      };
    }

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
        include: {
          propertyAmenities: {
            select: {
              amenity: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
          propertyImages: {
            select: {
              id: true,
              url: true,
              isPrimary: true,
            },
          },
        },
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

  getSignleProperty = async (id: string) => {
    const property = await prisma.property.findUnique({
      where: {
        id,
        isAvailable: true,
      },
      include: {
        propertyAmenities: {
          select: {
            amenity: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        propertyImages: {
          select: {
            id: true,
            url: true,
            isPrimary: true,
          },
        },
      },
    });
    if (!property) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Property not found. Please provide valid id.",
      );
    }

    return property;
  };

  createProperty = async (
    landlordId: string,
    payload: createPropertyPayload,
  ) => {
    const {
      images,
      amenityIds,
      categoryId,
      description,
      area,
      ...propertyPayload
    } = payload;

    const normalizedImages = this.validateImages(images);

    const uniqueAmenityIds = await this.validateRelations(
      categoryId,
      amenityIds,
    );

    await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          landlordId,
          categoryId,
          ...propertyPayload,
          ...(description && { description }),
          ...(area && { area }),
        },
      });

      await this.syncPropertyRelations(
        tx,
        property.id,
        uniqueAmenityIds,
        normalizedImages,
      );

      return tx.property.findUnique({
        where: {
          id: property.id,
        },
        include: {
          propertyAmenities: {
            include: {
              amenity: true,
            },
          },
          propertyImages: true,
        },
      });
    });
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
      images,
    } = payload;

    const normalizedImages = this.validateImages(images);

    const uniqueAmenityIds = await this.validateRelations(
      categoryId,
      amenityIds,
    );

    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id },
        data: {
          ...(area && { area }),
          ...(address && { address }),
          ...(bathrooms && { bathrooms }),
          ...(bedrooms && { bedrooms }),
          ...(city && { city }),
          ...(description && { description }),
          ...(division && { division }),
          ...(rentPrice && { rentPrice }),
          ...(title && { title }),
        },
      });

      await this.syncPropertyRelations(
        tx,
        id,
        uniqueAmenityIds,
        normalizedImages,
      );

      return tx.property.findUnique({
        where: {
          id,
        },
        include: {
          propertyAmenities: {
            include: {
              amenity: true,
            },
          },
          propertyImages: true,
        },
      });
    });
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
        httpStatus.NOT_FOUND,
        "Property not found. Please provide a valid property id.",
      );
    }
    // ownership validation
    if (existsProperty.landlordId !== landlordId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
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
