import { z } from "zod";
import type { rentalRequestBodySchema } from "./rental.validation";

export type TCreateRentalPayload = z.infer<typeof rentalRequestBodySchema>;

export type TUpdateRentalPayload = Omit<TCreateRentalPayload, "propertyId">;
