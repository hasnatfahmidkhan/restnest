import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { getAllUsersQuerySchema } from "./admin.validation";

const router = Router();

router.get(
  "/users",
  auth(UserRole.ADMIN),
  validateRequest(getAllUsersQuerySchema),
  adminController.getAllUsers,
);

export const adminRoute = router;
