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
      throw new AppError(htppStatus.UNAUTHORIZED, "Access forbidden");
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
}

export const reviewService = new ReviewService();
