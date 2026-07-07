import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";

class PropertyController {
  getAllProperties = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const properties = await propertyService.getAllProperties(req.query);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Retrieved all properties successfully",
      data: properties,
    });
  });

  createProperty = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const landlordId = req.user?.id as string;
    const property = await propertyService.createProperty(landlordId, req.body);
    sendResponse(res, {
      statusCode: htppStatus.CREATED,
      message: "Property created successfully",
      data: property,
    });
  });

  updateProperty = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});

  deleteProperty = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {});
}

export const propertyController = new PropertyController();
