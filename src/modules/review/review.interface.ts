import { z } from "zod";
import type { createReviewSchema } from "./review.validation";

export type reviewPayload = z.infer<typeof createReviewSchema>["body"];
