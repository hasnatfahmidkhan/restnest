import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { propertyController } from "./property.controller";
import {
  createPropertySchema,
  getAllPropertiesQuerySchema,
  getSignlePropertySchema,
} from "./property.validation";

const router = Router();

// get all properties
router.get(
  "/properties",
  validateRequest(getAllPropertiesQuerySchema),
  propertyController.getAllProperties,
);

// get single property
router.get(
  "/properties/:id",
  validateRequest(getSignlePropertySchema),
  propertyController.getSignleProperty,
);

// create property
router.post(
  "/landlord/properties",
  auth(UserRole.LANDLORD),
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);

// update property
router.patch(
  "/landlord/properties/:propertyId",
  auth(UserRole.LANDLORD),
  propertyController.updateProperty,
);

// delete property
router.delete(
  "/landlord/properties/:propertyId",
  auth(UserRole.LANDLORD),
  propertyController.deleteProperty,
);

export const propertyRoute = router;
