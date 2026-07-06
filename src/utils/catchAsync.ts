import { type RequestHandler } from "express";
import type { Tnext, TReq, TRes } from "../types";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: TReq, res: TRes, next: Tnext) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
