import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import {
  createRentalRequestSchema,
  getRequestsSchema,
  rentalRequestParamsSchema,
  updateRentalRequestStatusSchema,
} from "./rental.validation";

const router = Router();

router.get(
  "/",
  auth(UserRole.TENANT),
  validateRequest(getRequestsSchema),
  rentalController.getMyRentals,
);
router.get(
  "/landlord",
  auth(UserRole.LANDLORD),
  validateRequest(getRequestsSchema),
  rentalController.getLandlordRentalRequests,
);

router.post(
  "/:rentalId",
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
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

router.patch(
  "/tenant/requests/:id",
  auth(UserRole.TENANT),
  rentalController.cancelRentalRequest,
);

export const rentalRoute = router;
