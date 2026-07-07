import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { propertyController } from "./property.controller";
import {
  createPropertySchema,
  getAllPropertiesQuerySchema,
} from "./property.validation";

const router = Router();

// get all properties
router.get(
  "/properties",
  validateRequest(getAllPropertiesQuerySchema),
  propertyController.getAllProperties,
);

// create property
router.post(
  "/landlord/properties",
  auth(UserRole.LANDLORD),
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);

export const propertyRoute = router;
