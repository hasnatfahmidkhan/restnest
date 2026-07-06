import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";

class CategoryController {
  // create category
  createCategory = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});
}


export const categoryController = new CategoryController()