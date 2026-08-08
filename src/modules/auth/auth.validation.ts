import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums";

export const loginBodySchema = z.object(
  {
    email: z.email("Please provide a valid email address").trim(),

    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters"),
  },
  { error: "Request body is required" },
);

export const loginUserSchema = z.object({
  body: loginBodySchema,
});

export const registerUserSchema = z.object({
  body: loginBodySchema.extend({
    profilePhoto: z.url("Profile photo must be a valid URL"),

    role: z
      .enum([UserRole.TENANT, UserRole.LANDLORD], {
        error: () => ({
          message: "Role must be either TENANT or LANDLORD",
        }),
      })
      .optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters.")
      .max(100, "Name cannot exceed 100 characters.")
      .optional(),

    phone: z
      .string()
      .trim()
      .min(11, "Phone number must be at least 10 characters.")
      .max(20, "Phone number cannot exceed 20 characters.")
      .optional(),

    profilePhoto: z.url("Invalid profile photo URL.").optional(),

    bio: z
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters.")
      .optional(),
  }),
});
