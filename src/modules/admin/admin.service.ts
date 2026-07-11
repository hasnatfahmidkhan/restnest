import httpStatus from "http-status";
import {
  UserRole,
  UserStatus,
  type Prisma,
} from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { adminQuery } from "./admin.interface";

class AdminService {
  getAllUsers = async (query: adminQuery) => {
    const { page, limit, searchTerm, role, status, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status === "ACTIVE" ? UserStatus.ACTIVE : UserStatus.BAN;
    }

    const [total, users] = await Promise.all([
      await prisma.user.count({ where }),
      await prisma.user.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip,
      }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: users,
    };
  };

  updateUserStatus = async (
    id: string,
    status: UserStatus,
    adminId: string,
  ) => {
    // Cannot change your own status
    if (id === adminId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You cannot change your own status.",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, `User not found with id: ${id}`);
    }

    // Cannot change another admin's status
    if (user.role === UserRole.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You cannot change another admin's status.",
      );
    }

    // Already in requested status
    if (user.status === status) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `User is already ${status.toLowerCase()}.`,
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status,
      },
    });
    return updatedUser;
  };
}

export const adminService = new AdminService();
