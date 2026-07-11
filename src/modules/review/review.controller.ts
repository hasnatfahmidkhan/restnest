import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import {
  createReviewSchema,
  getPropertyReviewsSchema,
} from "./review.validation";

class ReviewController {
  createReview = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const { params, body } = createReviewSchema.parse(req);
    const tenantId = req.user?.id as string;

    const review = await reviewService.createReview(params.id, body, tenantId);
    sendResponse(res, {
      statusCode: htppStatus.CREATED,
      message: "Review created successfully",
      data: review,
    });
  });

  getReviewsByPropertyId = catchAsync(
    async (req: TReq, res: TRes, next: Tnext) => {
      const propertyId = getPropertyReviewsSchema.parse(req).params.id;
      const reveiws = await reviewService.getReviewByProperty(propertyId);
      sendResponse(res, {
        statusCode: htppStatus.OK,
        message: "Retrieved reviews ",
        data: reveiws,
      });
    },
  );
}

export const reviewController = new ReviewController();
