import htppStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { createPropertyPayload } from "./property.interface";

class PropertyService {
  getAllProperties = async () => {};

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
