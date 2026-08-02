import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

class TenantService {
  stats = async (tenantId: string) => {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      activeRentals,
      rejectedRequests,
      cancelledRequests,
      completedRentals,
      totalPaid,
      recentRequests,
    ] = await Promise.all([
      prisma.rentalRequest.count({
        where: {
          tenantId,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          tenantId,
          status: RentalRequestStatus.PENDING,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          tenantId,
          status: RentalRequestStatus.APPROVED,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          tenantId,
          status: RentalRequestStatus.ACTIVE,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          tenantId,
          status: RentalRequestStatus.REJECTED,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          tenantId,
          status: RentalRequestStatus.CANCELED,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          tenantId,
          status: RentalRequestStatus.COMPLETED,
        },
      }),

      prisma.payment.aggregate({
        where: {
          rentalRequest: {
            tenantId,
          },
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.rentalRequest.findMany({
        where: {
          tenantId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          status: true,
          moveInDate: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              rentPrice: true,
              propertyImages: {
                where: {
                  isPrimary: true,
                },
                select: {
                  url: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        activeRentals,
        rejectedRequests,
        cancelledRequests,
        completedRentals,
        totalPaid: totalPaid._sum.amount ?? 0,
      },
      recentRequests,
    };
  };
}

const tenantService = new TenantService();

export default tenantService;
