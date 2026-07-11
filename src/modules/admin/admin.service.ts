import httpStatus from "http-status";
import {
  UserRole,
  UserStatus,
  type Prisma,
} from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { adminQuery, TGetAllPropertiesQuery } from "./admin.interface";

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

  getAllProperties = async (query: TGetAllPropertiesQuery) => {
    const {
      page,
      limit,
      searchTerm,
      city,
      division,
      category,
      landlordId,
      availability,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.PropertyWhereInput = {};

    if (searchTerm) {
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filter
    if (landlordId) {
      where.landlordId = landlordId;
    }

    if (city) {
      where.city = {
        equals: city,
        mode: "insensitive",
      };
    }

    if (division) {
      where.division = {
        equals: division,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = {
        name: {
          equals: category,
          mode: "insensitive",
        },
      };
    }

    if (availability) {
      where.isAvailable = availability;
    }

    const [total, properties] = await prisma.$transaction([
      prisma.property.count({
        where,
      }),

      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          propertyImages: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
          _count: {
            select: {
              rentalRequests: true,
            },
          },
          rentalRequests: {
            select: {
              review: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      properties,
    };
  };
}

export const adminService = new AdminService();
