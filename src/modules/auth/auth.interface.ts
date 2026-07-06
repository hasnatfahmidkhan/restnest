import { z } from "zod";
import type { loginBodySchema, registerUserSchema } from "./auth.validation";

export type registerUserPayload = z.infer<typeof registerUserSchema>["body"];
export type loginUserPayload = z.infer<typeof loginBodySchema>;
