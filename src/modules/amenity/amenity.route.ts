import { Router } from "express";
import { amenityController } from "./amenity.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();
router.get("/amenities", amenityController.getAllAmenity);

router.post('/admin/amenity', auth(UserRole.ADMIN), amenityController.createAmenity)

router.patch('/admin/amenity/:id', auth(UserRole.ADMIN), amenityController.updateAmenity)

router.delete('/admin/amenity/:id', auth(UserRole.ADMIN), amenityController.deleteAmenity)



export const amenityRoute = router;
