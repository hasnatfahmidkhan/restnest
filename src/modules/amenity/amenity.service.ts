import { prisma } from "../../lib/prisma";

class AmenityService {
  getAllAmenity = async () => {
    return await prisma.amenity.findMany({
      orderBy: {
        name: "asc",
      },
    });
  };

  createAmenity = async (name: string) => {};

  updateAmenity = async (name: string, id: string) => {};

  deleteAmenity = async (id: string) => {};
}

export const amenityService = new AmenityService();
