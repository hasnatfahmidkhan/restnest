import bcrypt from "bcryptjs";
import type { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type { loginUserPayload, registerUserPayload } from "./auth.interface";

class AuthService {
  registerUser = async (payload: registerUserPayload) => {
    const { email, password, profilePhoto, role } = payload;
    const isExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isExists) {
      throw new Error("User already exists. Please login.");
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

    const isExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!isExists) {
      throw new Error("User not exists, please register");
    }

    const comparePassword = await bcrypt.compare(password, isExists.password);
    if (!comparePassword) {
      throw new Error("Wrong password, please give correct password.");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: isExists.id,
        email,
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

    const refreshToken = jwtUtils.createJWTToken(
      jwtPayload,
      config.jwt_refresh_secret,
      config.jwt_refresh_expires_in as SignOptions,
    );

    return { accessToken, refreshToken, user };
  };
}

export const authService = new AuthService();
