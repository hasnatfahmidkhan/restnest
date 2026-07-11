import { z } from "zod";
import type { getAllUsersQuerySchema } from "./admin.validation";
import type { UserStatus } from "../../../generated/prisma/enums";

export type adminQuery = z.infer<typeof getAllUsersQuerySchema>["query"];

