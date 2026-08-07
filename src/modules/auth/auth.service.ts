import bcrypt from "bcryptjs";
import type { TokenPayload } from "google-auth-library";
import httpStatus from "http-status";
import type { SignOptions } from "jsonwebtoken";
import {
  AuthProvider,
  UserRole,
  UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import AppError from "../../errors/AppError";
import googleClient from "../../lib/googleAuth";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
  IGoogleLoginPayload,
  loginUserPayload,
  registerUserPayload,
} from "./auth.interface";

class AuthService {
  registerUser = async (payload: registerUserPayload) => {
    const { email, password, profilePhoto, role } = payload;
    const isExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isExists) {
      throw new AppError(
        httpStatus.CONFLICT,
        "User already exists. Please login.",
      );
    }

    // hashPasword
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...(role && { role: role }),
        profile: {
          create: {
            profilePhoto: profilePhoto,
          },
        },
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
      include: {
        profile: {
          select: {
            profilePhoto: true,
          },
        },
      },
    });

    return user;
  };

  loginUser = async (payload: loginUserPayload) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        profile: {
          select: {
            profilePhoto: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "Invalid email or password.");
    }

    if (user.password === null && user.googleId) {
      throw new Error(
        "User already has Register with google, try to login with login",
      );
    }

    const comparePassword = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!comparePassword) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    if (user.status === UserStatus.BAN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been blocked. Please contact support.",
      );
    }

    const jwtPayload = {
      id: user?.id!,
      email: user?.email!,
      role: user?.role!,
      status: user?.status!,
    };

    const accessToken = jwtUtils.createJWTToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in as SignOptions,
    );

    const { password: _, createdAt, updatedAt, ...userData } = user;

    const refreshToken = jwtUtils.createJWTToken(
      jwtPayload,
      config.jwt_refresh_secret,
      config.jwt_refresh_expires_in as SignOptions,
    );

    return { accessToken, refreshToken, userData };
  };

  getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
      include: {
        profile: true,
      },
    });

    return user;
  };

  getNewAccessToken = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found.");
    }

    const jwtPayload = {
      id: user?.id!,
      email: user?.email!,
      role: user?.role!,
      status: user?.status!,
    };

    const accessToken = jwtUtils.createJWTToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in as SignOptions,
    );

    return accessToken;
  };

  googleLogin = async (payload: IGoogleLoginPayload) => {
    let googleIdTokenPayload: TokenPayload | undefined | null = null;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: payload.idToken,
      });

      googleIdTokenPayload = ticket.getPayload();
    } catch (error) {
      console.log("Goolge Id token verification Failed!", error);
      throw new Error("Invalid Or Expired Google Id Token.");
    }

    if (!googleIdTokenPayload) {
      throw new Error("Invalid Or Expired Google Id Token.");
    }

    if (!googleIdTokenPayload.email) {
      throw new Error("Google Email is not found.");
    }

    if (!googleIdTokenPayload.name) {
      throw new Error("Google Name is not found.");
    }

    const isTenantExistsWithGoolgeAuth = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        role: UserRole.TENANT,
        googleId: googleIdTokenPayload.sub,
      },
    });

    let user = isTenantExistsWithGoolgeAuth;

    if (!isTenantExistsWithGoolgeAuth) {
      const isTenantExistsWithCredential = await prisma.user.findUnique({
        where: {
          email: googleIdTokenPayload.email,
          role: UserRole.TENANT,
          authProvider: AuthProvider.CREDENTIAL,
        },
      });

      if (isTenantExistsWithCredential) {
        if (isTenantExistsWithCredential.status === UserStatus.BAN) {
          throw new Error("User is Ban");
        }

        user = await prisma.user.update({
          where: {
            id: isTenantExistsWithCredential.id,
          },
          data: {
            googleId: googleIdTokenPayload.sub,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: googleIdTokenPayload.email,
            name: googleIdTokenPayload.name,
            authProvider: AuthProvider.GOOGLE,
            googleId: googleIdTokenPayload.sub,
            role: UserRole.TENANT,
            profile: {
              create: {
                ...(googleIdTokenPayload.picture && {
                  profilePhoto: googleIdTokenPayload.picture,
                }),
              },
            },
          },
        });
      }
    }

    if (!user) {
      throw new Error("User is not Found");
    }

    if (user.status === UserStatus.BAN) {
      throw new Error("User is Ban");
    }

    const jwtPayload = {
      id: user?.id!,
      email: user?.email!,
      role: user?.role!,
      status: user?.status!,
    };

    const accessToken = jwtUtils.createJWTToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in as SignOptions,
    );

    const { password: _, createdAt, updatedAt, ...userData } = user;

    const refreshToken = jwtUtils.createJWTToken(
      jwtPayload,
      config.jwt_refresh_secret,
      config.jwt_refresh_expires_in as SignOptions,
    );

    return {
      accessToken,
      refreshToken,
    };
  };
}

export const authService = new AuthService();
