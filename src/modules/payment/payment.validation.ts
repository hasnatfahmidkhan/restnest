import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    rentalRequestId: z.uuid({
      message: "Invalid Rental Request ID format. Must be a UUID",
    }),
  }),
});

export const getPaymentDetailsSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Payment ID format. Must be a UUID" }),
  }),
});

