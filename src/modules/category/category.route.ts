import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router = Router();

router.get("/", categoryController.getAllCategories);

router.post("/", auth(UserRole.LANDLORD), categoryController.createCategory);

router.patch('/:categoryId', categoryController.updateCategory)

router.delete('/:categoryId', categoryController.updateCategory)

export const categoryRoute = router;
