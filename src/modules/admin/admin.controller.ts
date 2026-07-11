import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import {
  getAllPropertiesQuerySchema,
  getAllRentalsQuerySchema,
  getAllUsersQuerySchema,
  userStatusUpdateSchema,
} from "./admin.validation";

class AdminController {
  getAllUsers = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const parsedQeury = getAllUsersQuerySchema.parse({
      query: req.query,
    }).query;
    const users = await adminService.getAllUsers(parsedQeury);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Retrieved all users",
      data: users,
    });
  });

  updateUserStatus = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const { params, body } = userStatusUpdateSchema.parse(req);
    const adminId = req.user?.id as string;
    const updateStatus = await adminService.updateUserStatus(
      params.id,
      body.status,
      adminId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "user status updated",
      data: updateStatus,
    });
  });

  getAllProperties = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const query = getAllPropertiesQuerySchema.parse({ query: req.query }).query;
    const properties = await adminService.getAllProperties(query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "user status updated",
      data: properties,
    });
  });

  getAllRentals = catchAsync(async (req, res) => {
    const parsedQuery = getAllRentalsQuerySchema.parse({
      query: req.query,
    }).query;
    const result = await adminService.getAllRentals(parsedQuery);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Retrieved all rental requests successfully.",
      meta: result.meta,
      data: result.data,
    });
  });
}

export const adminController = new AdminController();
