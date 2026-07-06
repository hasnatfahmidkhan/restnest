import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";

class CategoryService {
  // get categories
  getAllCategories = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {},
  );

  // create category
  createCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});

  //   updaete category
  updateCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});

  // delete category
  deleteCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});
}

export const categoryService = new CategoryService();
