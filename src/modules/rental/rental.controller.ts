import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
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

  getRentalDetails = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const id = req.user?.id as string;
    const rentalId = req.params.rentalId as string;

    const rentalRequest = await rentalService.getRentalDetails(id, rentalId);
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
}

export const rentalController = new RentalController();
