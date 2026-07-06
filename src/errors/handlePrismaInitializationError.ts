import httpStatus from "http-status";
import type { Prisma } from "../../generated/prisma/client";

const handlePrismaInitializationError = (
  error: Prisma.PrismaClientInitializationError,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Database initialization failed.";

  switch (error.errorCode) {
    case "P1000":
      statusCode = httpStatus.UNAUTHORIZED;
      message =
        "Database authentication failed. Please check your database credentials.";
      break;

    case "P1001":
      statusCode = httpStatus.SERVICE_UNAVAILABLE;
      message = "Unable to reach the database server.";
      break;

    case "P1002":
      statusCode = httpStatus.REQUEST_TIMEOUT;
      message = "Database connection timed out.";
      break;

    default:
      message = error.message;
  }

  return {
    statusCode,
    message,
    errorDetails: [
      {
        path: "",
        message,
      },
    ],
  };
};

export default handlePrismaInitializationError;
