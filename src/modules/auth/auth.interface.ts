import { z } from "zod";
import type { registerUserSchema } from "./auth.validation";

export type registerUserPayload = z.infer<typeof registerUserSchema>["body"];
