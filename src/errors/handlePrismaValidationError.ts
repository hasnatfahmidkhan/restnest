import httpStatus from "http-status";
import type { Prisma } from "../../generated/prisma/client";

const handlePrismaValidationError = (error: Prisma.PrismaClientValidationError) => {
  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Prisma Validation Error",
    errorDetails: [
      {
        path: "",
        name: error.name,
        message: error.message,
      },
    ],
  };
};

export default handlePrismaValidationError;
