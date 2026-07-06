import httpStatus from "http-status";
import type { Prisma } from "../../generated/prisma/client";

const handlePrismaKnownError = (
  error: Prisma.PrismaClientKnownRequestError,
) => {
  let statusCode: number = httpStatus.BAD_REQUEST;
  let message = "Database Error";
  let code;

  switch (error.code) {
    case "P2002":
      message = `Duplicate key error`;
      code = "P2002";
      break;

    case "P2003":
      message = "Foreign key constraint failed";
      code = "P2003";
      break;

    case "P2025":
      code = "P2025";
      message =
        "An operation failed because it depends on one or more records that were required but not found.";
      break;

    default:
      message = error.message;
      break;
  }

  return {
    statusCode,
    message,
    code,
    errorDetails: [
      {
        path: "",
        message,
      },
    ],
  };
};

export default handlePrismaKnownError;
