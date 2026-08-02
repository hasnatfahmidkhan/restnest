import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/:id",
  auth(UserRole.TENANT),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

router.get("/my-reviews", auth(UserRole.TENANT), reviewController.getMyReviews);

router.get("/:id", reviewController.getReviewsByPropertyId);

router.patch(
  "/:id",
  auth(UserRole.TENANT),
  validateRequest(updateReviewSchema),
  reviewController.updateReview,
);

export const reviewRoute = router;
