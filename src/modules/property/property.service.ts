import htppStatus from "http-status";
import type { PropertyWhereInput } from "../../../generated/prisma/models";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  createPropertyPayload,
  TGetAllPropertiesQuery,
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
          [sortBy]: sortOrder,
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

    const property = await prisma.property.create({
      data: {
        ...payload,
        description: payload.description ?? null,
        area: payload.area ?? null,
        landlordId,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    return property;
  };

  updateProperty = async () => {};

  deleteProperty = async () => {};
}

export const propertyService = new PropertyService();
