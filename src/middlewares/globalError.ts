import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import type { Tnext, TReq, TRes } from "../types";

export const globalErrorHandler = (
  err: any,
  req: TReq,
  res: TRes,
  next: Tnext,
) => {
  console.log("Error : ", err);

  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Internal Server Error";

  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "Validation Error";
    errorName = err.name;

    return res.status(statusCode).json({
      success: false,
      statusCode,
      name: errorName,
      message: errorMessage,
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      ((statusCode = httpStatus.BAD_REQUEST),
        (errorMessage = "Duplicate Key Error"));
    } else if (err.code === "P2003") {
      ((statusCode = httpStatus.BAD_REQUEST),
        (errorMessage = "Foreign key constraint failed"));
    } else if (err.code === "P2025") {
      ((statusCode = httpStatus.BAD_REQUEST),
        (errorMessage =
          "An operation failed because it depends on one or more records that were required but not found."));
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage =
        "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: errorMessage,
    error: config.node_env === "development" && err.stack,
  });
};
