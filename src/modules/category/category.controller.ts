import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

class CategoryController {
  // get categories
  getAllCategories = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {},
  );

  // create category
  createCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const { name } = req.body;
    const category = await categoryService.createCategory(name);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: category,
    });
  });

  //   updaete category
  updateCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});

  // delete category
  deleteCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});
}

export const categoryController = new CategoryController();
