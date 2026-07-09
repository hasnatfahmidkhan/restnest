import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

class PaymentController {
  createCheckoutSession = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {
      const tenantId = req.user?.id as string;
      const email = req.user?.email as string;
      const rentalRequestId = req.body.rentalRequestId as string;
      const session = await paymentService.createPaymentIntent(
        rentalRequestId,
        tenantId,
        email,
      );

      sendResponse(res, {
        statusCode: htppStatus.OK,
        message: "Checkout session create successfully",
        data: session,
      });
    },
  );
}

export const paymentController = new PaymentController();
