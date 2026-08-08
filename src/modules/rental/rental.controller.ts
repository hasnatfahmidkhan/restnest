import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { rentalRequestBodySchema } from "./rental.validation";

class RentalController {
  getMyRentals = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const id = req.user?.id as string;
    const rentalRequests = await rentalService.getMyRentals(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Retrieved rental requests successfully!",
      data: rentalRequests,
    });
  });

  getLandlordRentalRequests = catchAsync(async (req: TReq, res: TRes) => {
    const landlordId = req.user!.id;

    const rentals = await rentalService.getLandlordRentalRequests(
      landlordId,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Retrieved landlord rental requests successfully",
      data: rentals,
    });
  });

  getRentalDetails = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const tenantId = req.body.tenantId as string;
    const rentalId = req.params.rentalId as string;

    const rentalRequest = await rentalService.getRentalDetails(
      tenantId,
      rentalId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Retrieved rental request details successfully!",
      data: rentalRequest,
    });
  });

  createRentalRequest = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {
      const parsedBody = rentalRequestBodySchema.parse(req.body);
      const id = req.user?.id as string;
      const rentalRequest = await rentalService.createRentalRequest(
        parsedBody,
        id,
      );
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Rental request created successfully!",
        data: rentalRequest,
      });
    },
  );

  updateRentalRequestStatus = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {
      const rentalId = req.params.id as string;
      const landlordId = req.user?.id as string;
      const { status } = req.body;

      const updatedRentalRequest =
        await rentalService.updateRentalRequestStatus(
          landlordId,
          rentalId,
          status,
        );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Rental request status updated successfully!",
        data: updatedRentalRequest,
      });
    },
  );

  cancelRentalRequest = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {
      const tenantId = req.user?.id as string;
      const rentalId = req.params.id as string;
      await rentalService.cancelRentalRequest(rentalId, tenantId);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Updated successfully",
        data: null,
      });
    },
  );
}

export const rentalController = new RentalController();
