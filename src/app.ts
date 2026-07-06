import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import httpStatus from "http-status";
import config from "./config";
import type { TReq, TRes } from "./types/indext";
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

app.get("/", (req: TReq, res: TRes) => {
  res.status(httpStatus.OK).send("RestNest Server is Running");
});

export default app;
