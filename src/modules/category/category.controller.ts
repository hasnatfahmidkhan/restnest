import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

class CategoryController {
  // get categories
  getAllCategories = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const categories = await categoryService.getAllCategories();
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Retrieved all categories successfully",
      data: categories,
    });
  });

  // create category
  createCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const { name } = req.body;
    const category = await categoryService.createCategory(name);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: category,
    });
  });

  //   updaete category
  updateCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const categoryId = req.params.categoryId as string;
    const { name } = req.body;
    const category = await categoryService.updateCategory(categoryId, name);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Category updated successfully!",
      data: category,
    });
  });

  // delete category
  deleteCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const categoryId = req.params.categoryId as string;
    await categoryService.deleteCategory(categoryId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Category deleted Successfully!",
      data: null,
    });
  });
}

export const categoryController = new CategoryController();
