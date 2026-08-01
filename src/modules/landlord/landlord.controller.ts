import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import landlordService from "./landlord.service";

class LandlordController {
  stats = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const landlordId = req.user?.id as string;
    const statistics = await landlordService.stats(landlordId);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Get statistics successfully!",
      data: statistics,
    });
  });
}

const landlordController = new LandlordController();
export default landlordController;
