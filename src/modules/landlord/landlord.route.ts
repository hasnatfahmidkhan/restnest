import { Router } from "express";
import landlordController from "./landlord.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/stats", auth(UserRole.LANDLORD),landlordController.stats);
export const landlordRoute = router;
