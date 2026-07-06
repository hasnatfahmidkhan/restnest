import httpStatus from "http-status";
import type { ZodError } from "zod";

const handleZodError = (error: ZodError) => {
  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Validation Error",
    errorDetails: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
};

export default handleZodError;
