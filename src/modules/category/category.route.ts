import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();

router.get("/", categoryController.getAllCategories);

router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);

router.patch(
  "/:categoryId",
  auth(UserRole.ADMIN),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete("/:categoryId", categoryController.deleteCategory);

export const categoryRoute = router;
