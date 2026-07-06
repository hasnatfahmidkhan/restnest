import type { NextFunction, Request, Response } from "express";

export type TRes = Response;
export type TReq = Request;
export type Tnext = NextFunction;
declare global {
  namespace Express {
    interface Request {
      user?: {
        user?: {
          id: string;
          email: string;
          role: "";
          name: string;
        };
      };
    }
  }
}
