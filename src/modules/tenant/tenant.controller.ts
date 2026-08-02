import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import tenantService from "./tenant.service";

class TenantController {
  stats = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const tenantId = req.user?.id as string;

    const statistics = await tenantService.stats(tenantId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Tenant dashboard statistics retrieved successfully.",
      data: statistics,
    });
  });
}

const tenantController = new TenantController();

export default tenantController;
