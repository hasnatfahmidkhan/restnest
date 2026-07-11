import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { amenityService } from "./amenity.service";

class AmenityController {
  getAllAmenity = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const amenities = await amenityService.getAllAmenity();
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Retrieved all amenities successfully!",
      data: amenities,
    });
  });

  createAmenity = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const amenity = await amenityService.createAmenity(req.body.amenities);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "create amenity successfully!",
      data: amenity,
    });
  });

  updateAmenity = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const amenity = await amenityService.updateAmenity(
      req.body.name,
      req.params?.id as string,
    );
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "update amenity successfully!",
      data: amenity,
    });
  });

  deleteAmenity = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    await amenityService.deleteAmenity(req.params?.id as string);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "delete amenity successfully!",
      data: null,
    });
  });
}

export const amenityController = new AmenityController();
