import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../types";

export const notFoundHandler = (req: TReq, res: TRes, next: Tnext): void => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `Not Found - Cannot ${req.method} ${req.originalUrl}`,
  });
};
