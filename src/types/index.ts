import type { NextFunction, Request, Response } from "express";
import type { UserRole, UserStatus } from "../../generated/prisma/enums";

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
          role: UserRole;
          status: UserStatus;
        };
      };
    }
  }
}
