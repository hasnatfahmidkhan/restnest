import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import { UserStatus, type UserRole } from "../../generated/prisma/enums";
import config from "../config";
import AppError from "../errors/AppError";
import { prisma } from "../lib/prisma";
import type { Tnext, TReq, TRes } from "../types";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

const auth = (...requiredRoles: UserRole[]) =>
  catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    // 1. get token from authorization header or cookie
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    // 2. check if token exists
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authenticated!");
    }

    // 3. verify the token
    const { verifiedToken: decoded }: JwtPayload = jwtUtils.verifyJWTToken(
      token,
      config.jwt_access_secret,
    );

    // check user exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!existingUser) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist!");
    }

    // 4.  check if user is banned
    if (existingUser.status === UserStatus.BAN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been banned. Please contact support.",
      );
    }

    // 5. attach decoded user to request
    req.user = decoded;

    // 6. Check role
    if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are forbidden!");
    }

    // 7. Continue
    next();
  });
export default auth;
