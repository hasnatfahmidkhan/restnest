import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import {
  getAllUsersQuerySchema,
  userStatusUpdateSchema,
} from "./admin.validation";

const router = Router();

router.get(
  "/users",
  auth(UserRole.ADMIN),
  validateRequest(getAllUsersQuerySchema),
  adminController.getAllUsers,
);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  validateRequest(userStatusUpdateSchema),
  adminController.updateUserStatus,
);

export const adminRoute = router;
