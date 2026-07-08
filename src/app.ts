import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import httpStatus from "http-status";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalError";
import { notFoundHandler } from "./middlewares/notFound";
import { amenityRoute } from "./modules/amenity/amenity.route";
import { authRoute } from "./modules/auth/auth.route";
import { categoryRoute } from "./modules/category/category.route";
import { propertyRoute } from "./modules/property/property.route";
import type { TReq, TRes } from "./types";
const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// 1. All your actual API Routes go here
app.get("/", (req: TReq, res: TRes) => {
  res.status(httpStatus.OK).send("RestNest Server is Running");
});

// Auth related apis
app.use("/api/auth", authRoute);

// category related apis
app.use("/api/category", categoryRoute);

// property related apis
app.use("/api", propertyRoute);

// amenity route
app.use("/api", amenityRoute);

// 2. ⚠️ THE NOT FOUND MIDDLEWARE (Catches anything that didn't match above)
app.use(notFoundHandler);

// 3. Global Error Handler (Catches server crashes/thrown errors)
app.use(globalErrorHandler);

export default app;
