import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import {
  createRentalRequestSchema,
  rentalRequestParamsSchema,
  updateRentalRequestStatusSchema,
} from "./rental.validation";

const router = Router();

router.get("/", auth(UserRole.TENANT), rentalController.getMyRentals);
router.get(
  "/landlord",
  auth(UserRole.LANDLORD),
  rentalController.getLandlordRentalRequests,
);

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

// update property rental request status
router.patch(
  "/landlord/requests/:id",
  auth(UserRole.LANDLORD),
  validateRequest(updateRentalRequestStatusSchema),
  rentalController.updateRentalRequestStatus,
);

export const rentalRoute = router;
