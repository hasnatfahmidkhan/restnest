import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import {
  createCheckoutSessionSchema,
  getPaymentDetailsSchema,
} from "./payment.validation";

const router = Router();

// Create a payment intent
router.post(
  "/create",
  auth(UserRole.TENANT),
  validateRequest(createCheckoutSessionSchema),
  paymentController.createCheckoutSession,
);
router.post("/confirm", paymentController.handleWebhook);

router.get("/", auth(UserRole.TENANT), paymentController.paymentHistory);
router.get(
  "/:id",
  auth(UserRole.TENANT),
  validateRequest(getPaymentDetailsSchema),
  paymentController.paymentDetails,
);
export const paymentRoute = router;
