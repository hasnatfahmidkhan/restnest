import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";
import { propertyQuerySchema } from "./property.validation";

class PropertyController {
  getAllProperties = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const parsed = propertyQuerySchema.parse(req.query);
    const properties = await propertyService.getAllProperties(parsed);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Retrieved all properties successfully",
      data: properties,
    });
  });

  getSignleProperty = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const id = req.params.id as string;
    const property = await propertyService.getSignleProperty(id);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Property retrieved successfully.",
      data: property,
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

  updateProperty = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const propertyId = req.params.propertyId as string;
    const landlordId = req.user?.id as string;
    const updateProperty = await propertyService.updateProperty(
      propertyId,
      landlordId,
      req.body,
    );

    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Property updated successfully.",
      data: updateProperty,
    });
  });

  deleteProperty = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const landlordId = req.user?.id as string;
    const propertyId = req.params.propertyId as string;
    await propertyService.deleteProperty(landlordId, propertyId);
    sendResponse(res, {
      statusCode: htppStatus.OK,
      message: "Property deleted successfully",
      data: null,
    });
  });
}

export const propertyController = new PropertyController();
