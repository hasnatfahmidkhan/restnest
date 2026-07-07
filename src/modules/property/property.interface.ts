import { z } from "zod";
import type { propertyValidationSchema } from "./property.validation";

export type createPropertyPayload = z.infer<typeof propertyValidationSchema>;
export type updatePropertyPayload = Partial<
  z.infer<typeof propertyValidationSchema>
>;
