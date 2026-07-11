import { z } from "zod";
import type { getAllUsersQuerySchema } from "./admin.validation";

export type adminQuery = z.infer<typeof getAllUsersQuerySchema>["query"];
