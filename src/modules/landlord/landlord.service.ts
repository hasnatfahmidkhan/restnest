import {
  PaymentStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

class LandlordService {
  stats = async (landlordId: string) => {
    const [
      totalProperties,
      availableProperties,
      rentedProperties,
      totalRentalRequests,
      pendingRequests,
      approvedRequests,
      activeRentals,
      completedRentals,
      revenue,
      averageRating,
    ] = await Promise.all([
      prisma.property.count({
        where: {
          landlordId,
        },
      }),

      prisma.property.count({
        where: {
          landlordId,
          isAvailable: true,
        },
      }),

      prisma.property.count({
        where: {
          landlordId,
          isAvailable: false,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          property: {
            landlordId,
          },
        },
      }),

      prisma.rentalRequest.count({
        where: {
          property: {
            landlordId,
          },
          status: RentalRequestStatus.PENDING,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          property: {
            landlordId,
          },
          status: RentalRequestStatus.APPROVED,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          property: {
            landlordId,
          },
          status: RentalRequestStatus.ACTIVE,
        },
      }),

      prisma.rentalRequest.count({
        where: {
          property: {
            landlordId,
          },
          status: RentalRequestStatus.COMPLETED,
        },
      }),

      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          rentalRequest: {
            property: {
              landlordId,
            },
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.review.aggregate({
        where: {
          rentalRequest: {
            property: {
              landlordId,
            },
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    return {
      totalProperties,
      availableProperties,
      rentedProperties,

      totalRentalRequests,
      pendingRequests,
      approvedRequests,
      activeRentals,
      completedRentals,

      totalRevenue: revenue._sum.amount ?? 0,

      averageRating: averageRating._avg.rating ?? 0,
      totalReviews: averageRating._count.rating,
    };
  };
}

const landlordService = new LandlordService();
export default landlordService;
