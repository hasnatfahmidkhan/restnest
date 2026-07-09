import { paymentController } from './payment.controller';
import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// Create a payment intent
router.post('/create', auth(UserRole.TENANT), paymentController.createCheckoutSession)

export const paymentRoute = router;
