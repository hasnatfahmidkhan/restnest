import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import { getAllUsersQuerySchema } from "./admin.validation";

class AdminController {
  getAllUsers = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const parsedQeury = getAllUsersQuerySchema.parse({
      query: req.query,
    }).query;
    const users = await adminService.getAllUsers(parsedQeury);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Retrieved all users",
      data: users,
    });
  });
}

export const adminController = new AdminController();
