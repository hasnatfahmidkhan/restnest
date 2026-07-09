import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";

class PaymentService {
  createPaymentIntent = async (id: string, tenantId: string, email: string) => {
    // check rental request exists
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: {
        id,
      },
      include: {
        property: true,
      },
    });

    if (!rentalRequest) {
      throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    // tenant ownership verification
    if (rentalRequest.tenantId !== tenantId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Unauthorized to access this rental request",
      );
    }

    // check if rental request is approved
    if (rentalRequest.status !== "APPROVED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment can only be made for approved rental requests",
      );
    }

    // check if payment already exists for this rental request
    const existingPayment = await prisma.payment.findFirst({
      where: {
        rentalRequestId: id,
      },
    });

    if (existingPayment) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment has already been made for this rental request",
      );
    }

    // create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: rentalRequest.property.title,
              ...(rentalRequest.property.description && {
                description: rentalRequest.property.description,
              }),
              //   images:[]
            },
            unit_amount: Math.round(
              Number(rentalRequest.property.rentPrice) * 100,
            ),
          },
          quantity: 1,
        },
      ],
      mode: "payment",

      customer_email: email,

      success_url: `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/payment/cancel`,
      metadata: {
        rentalRequestId: id,
        tenantId,
        propertyId: rentalRequest.propertyId,
      },
    });

    return { url: session.url, sessionId: session.id };
  };
}

export const paymentService = new PaymentService();
