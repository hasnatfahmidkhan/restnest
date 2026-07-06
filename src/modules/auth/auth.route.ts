import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { loginUserSchema, registerUserSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserSchema),
  authController.register,
);

router.post("/login", validateRequest(loginUserSchema), authController.login);

router.get(
  "/me",
  auth(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN),
  authController.getProfile,
);

export const authRoute = router;
