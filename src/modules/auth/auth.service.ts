import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import type { registerUserPayload } from "./auth.interface";

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
}

export const authService = new AuthService();
