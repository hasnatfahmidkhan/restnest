import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/:id",
  auth(UserRole.TENANT),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

export const reviewRoute = router;
