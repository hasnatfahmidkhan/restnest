import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

class AmenityService {
  getAllAmenity = async () => {
    return await prisma.amenity.findMany({
      orderBy: {
        name: "asc",
      },
    });
  };

  // amenityExistshandler
  private amenityExistsHandler = async (id: string) => {
    const amenityExists = await prisma.amenity.findUnique({
      where: {
        id,
      },
    });
    return amenityExists;
  };

  createAmenity = async (amenities: string[]) => {
    // Remove duplicates from request body
    const uniqueAmenities = [...new Set(amenities)];

    // Find existing amenities

    await prisma.$transaction(async (tx) => {
      const existing = await tx.amenity.findMany({
        where: {
          name: {
            in: uniqueAmenities,
          },
        },
        select: {
          name: true,
        },
      });

      if (existing.length) {
        throw new AppError(
          httpStatus.CONFLICT,
          "Some amenities already exist.",
        );
      }

      await tx.amenity.createMany({
        data: uniqueAmenities.map((name) => ({ name })),
      });
    });

    return await prisma.amenity.findMany({
      where: {
        name: {
          in: uniqueAmenities,
        },
      },
    });
  };

  updateAmenity = async (name: string, id: string) => {
    const amenityExists = await this.amenityExistsHandler(id);

    if (!amenityExists) {
      throw new AppError(httpStatus.NOT_FOUND, "Amenity not found.");
    }

    return await prisma.amenity.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  };

  deleteAmenity = async (id: string) => {
    const amenityExists = await this.amenityExistsHandler(id);

    if (!amenityExists) {
      throw new AppError(httpStatus.NOT_FOUND, "Amenity not found.");
    }

    return await prisma.amenity.delete({
      where: {
        id,
      },
    });
  };
}

export const amenityService = new AmenityService();
