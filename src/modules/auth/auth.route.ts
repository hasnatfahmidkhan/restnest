import { Router } from "express";
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

export const authRoute = router;
