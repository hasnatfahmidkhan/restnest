import { z } from "zod";
import type {
  propertyQuerySchema,
  propertyValidationSchema,
} from "./property.validation";

export type createPropertyPayload = z.infer<typeof propertyValidationSchema>;
export type updatePropertyPayload = Partial<
  z.infer<typeof propertyValidationSchema>
>;

export const PropertySearchableFields = [
  "title",
  "description",
  "address",
  "city",
  "division",
] as const;

export const PropertySortableFields = [
  "createdAt",
  "rentPrice",
  "averageRating",
] as const;

export type TGetAllPropertiesQuery = 
  z.infer<typeof propertyQuerySchema>
;
