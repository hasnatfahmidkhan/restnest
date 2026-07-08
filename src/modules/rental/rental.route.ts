import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import { createRentalRequestSchema } from "./rental.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.TENANT),
  validateRequest(createRentalRequestSchema),
  rentalController.createRentalRequest,
);

export const rentalRoute = router;
