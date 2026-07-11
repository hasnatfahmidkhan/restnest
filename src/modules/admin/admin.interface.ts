import { z } from "zod";
import type { UserStatus } from "../../../generated/prisma/enums";
import type {
  getAllPropertiesQuerySchema,
  getAllUsersQuerySchema,
} from "./admin.validation";

export type adminQuery = z.infer<typeof getAllUsersQuerySchema>["query"];

export type TUserStatus = typeof UserStatus;

export type TGetAllPropertiesQuery = z.infer<
  typeof getAllPropertiesQuerySchema
>["query"];
