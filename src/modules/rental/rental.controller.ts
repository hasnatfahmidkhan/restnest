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
}

export const rentalController = new RentalController();
