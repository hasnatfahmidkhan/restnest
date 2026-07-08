import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import {
  createRentalRequestSchema,
  rentalRequestParamsSchema,
} from "./rental.validation";

const router = Router();

router.get("/", auth(UserRole.TENANT), rentalController.getMyRentals);

router.get(
  "/:rentalId",
  auth(UserRole.TENANT),
  validateRequest(rentalRequestParamsSchema),
  rentalController.getRentalDetails,
);

router.post(
  "/",
  auth(UserRole.TENANT),
  validateRequest(createRentalRequestSchema),
  rentalController.createRentalRequest,
);

export const rentalRoute = router;
