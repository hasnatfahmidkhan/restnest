import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

class CategoryService {
  // get categories
  getAllCategories = async () => {};

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
        createAt: true,
        updatedAt: true,
      },
    });
    return category;
  };

  //   updaete category
  updateCategory = async () => {};

  // delete category
  deleteCategory = async () => {};
}

export const categoryService = new CategoryService();
