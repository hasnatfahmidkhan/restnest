import { UserStatus, type Prisma } from "../../../generated/prisma/client";
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
}

export const adminService = new AdminService();
