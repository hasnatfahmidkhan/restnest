import htppStatus from "http-status";
import {
  PaymentStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { reviewPayload } from "./review.interface";

class ReviewService {
  createReview = async (
    id: string,
    payload: reviewPayload,
    tenantId: string,
  ) => {
    const { rating, comment } = payload;
    // check rental exists
    const existsRental = await prisma.rentalRequest.findUnique({
      where: {
        id,
      },
      include: {
        payment: {
          select: {
            status: true,
            id: true,
          },
        },
      },
    });
    if (!existsRental) {
      throw new AppError(htppStatus.NOT_FOUND, "Rental Request not found!");
    }

    if (existsRental.tenantId !== tenantId) {
      throw new AppError(
        htppStatus.UNAUTHORIZED,
        "Access forbidden, please provide valid rental Id",
      );
    }

    if (
      existsRental.status !== RentalRequestStatus.COMPLETED ||
      existsRental.payment?.status !== PaymentStatus.COMPLETED
    ) {
      throw new AppError(
        htppStatus.UNAUTHORIZED,
        "Access forbidden, rental is not completed yet!",
      );
    }

    // check tenant already review it or not
    const review = await prisma.review.findUnique({
      where: {
        rentalId: id,
      },
    });

    if (review) {
      throw new AppError(htppStatus.CONFLICT, "Review already created");
    }

    // create review
    const newReview = await prisma.review.create({
      data: {
        rating,
        rentalId: id,
        ...(comment && { comment }),
      },
    });

    return newReview;
  };

  getReviewByProperty = async (propertyId: string) => {
    const summary = await prisma.review.aggregate({
      where: {
        rentalRequest: {
          propertyId,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
        id: true,
      },
    });
    const reviews = await prisma.review.findMany({
      where: {
        rentalRequest: {
          propertyId,
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        rentalRequest: {
          select: {
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      summary: {
        averageRating: summary._avg.rating ?? 0,
        totalRatings: summary._count.rating,
        totalReviews: summary._count.id,
      },
      reviews,
    };
  };

  getMyReviews = async (tenantId: string) => {
    const reviews = await prisma.review.findMany({
      where: {
        rentalRequest: {
          tenantId,
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        rentalRequest: {
          select: {
            property: {
              select: {
                id: true,
                title: true,
                propertyImages: {
                  where: {
                    isPrimary: true,
                  },
                  select: {
                    id: true,
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // check if reviews is empty
    if (reviews.length === 0) {
      throw new AppError(htppStatus.NOT_FOUND, "No reviews found");
    }

    // return reviews
    return reviews;
  };

  // update review
  updateReview = async (
    reviewId: string,
    payload: reviewPayload,
    tenantId: string,
  ) => {
    const { rating, comment } = payload;
    // check review exists
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        rentalRequest: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!review) {
      throw new AppError(htppStatus.NOT_FOUND, "Review not found");
    }

    if (review.rentalRequest.tenantId !== tenantId) {
      throw new AppError(htppStatus.UNAUTHORIZED, "Access forbidden");
    }

    // update review
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        ...(comment && { comment }),
      },
    });

    return updatedReview;
  };
}

export const reviewService = new ReviewService();
