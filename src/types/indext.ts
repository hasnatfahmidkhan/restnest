import type { Request, Response } from "express";

export type TRes = Response;
export type TReq = Request;

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
