import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import handlePrismaInitializationError from "../errors/handlePrismaInitializationError";
import handlePrismaKnownError from "../errors/handlePrismaKnownError";
import handlePrismaValidationError from "../errors/handlePrismaValidationError";
import handleZodError from "../errors/handleZodError";
import type { Tnext, TReq, TRes } from "../types";

export const globalErrorHandler = (
  err: any,
  req: TReq,
  res: TRes,
  next: Tnext,
) => {
  console.log("Error : ", err);

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let errorDetails: any[] = [];
  let code;

  if (err instanceof ZodError)
    ({ statusCode, errorDetails, message } = handleZodError(err));

  if (err instanceof Prisma.PrismaClientValidationError)
    ({ statusCode, message, errorDetails } = handlePrismaValidationError(err));

  if (err instanceof Prisma.PrismaClientKnownRequestError)
    ({ statusCode, message, errorDetails, code } = handlePrismaKnownError(err));

  if (err instanceof Prisma.PrismaClientInitializationError)
    ({ statusCode, message, errorDetails } =
      handlePrismaInitializationError(err));

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Error occurred during query execution";
  }

  res.status(statusCode).json({
    success: false,
    code: code && code,
    message,
    errorDetails,
    stack: config.node_env === "development" ? err.stack : undefined,
  });
};
