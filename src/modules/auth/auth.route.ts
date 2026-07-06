import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { registerUserSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserSchema),
  authController.register,
);

export const authRoute = router;
