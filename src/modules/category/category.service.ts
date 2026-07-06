import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

class CategoryService {
  // get categories
  getAllCategories = async () => {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return categories;
  };

  // create category
  createCategory = async (name: string) => {
    const categoryExists = await prisma.category.findUnique({
      where: {
        name,
      },
    });

    // check if category exist
    if (categoryExists) {
      throw new AppError(httpStatus.CONFLICT, "Category already exists");
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
    return category;
  };

  //   updaete category
  updateCategory = async (id: string, name: string) => {
    const categoryExists = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!categoryExists)
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Category Not Found!. Please provide valid id.",
      );

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
      },
      omit: {
        updatedAt: true,
      },
    });

    return category;
  };

  // delete category
  deleteCategory = async (id: string) => {
    const categoryExists = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!categoryExists)
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Category Not Found!. Please provide valid id.",
      );

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return null;
  };
}

export const categoryService = new CategoryService();
