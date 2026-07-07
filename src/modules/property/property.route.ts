import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { propertyController } from "./property.controller";
import { createPropertySchema } from "./property.validation";

const router = Router();

// create property
router.post(
  "/landlord/properties",
  auth(UserRole.LANDLORD),
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);

export const propertyRoute = router;
