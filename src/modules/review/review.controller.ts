import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import { createReviewSchema } from "./review.validation";

class ReviewController {
  createReview = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const id = req.params.id as string;
    // const parsedBody = createReviewSchema.parse(req.body).body;
    const tenantId = req.user?.id as string;

    const review = await reviewService.createReview(id, req.body, tenantId);
    sendResponse(res, {
      statusCode: htppStatus.CREATED,
      message: "Review created successfully",
      data: review,
    });
  });
}

export const reviewController = new ReviewController();
