import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import tenantController from "./tenant.controller";

const router = Router();

router.get("/stats", auth(UserRole.TENANT), tenantController.stats);

export const tenantRoute = router;
