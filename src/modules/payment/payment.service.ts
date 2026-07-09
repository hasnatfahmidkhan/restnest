import httpStatus from "http-status";
import type Stripe from "stripe";
import {
  PaymentStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
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

    await prisma.payment.create({
      data: {
        amount: rentalRequest.property.rentPrice,
        rentalRequestId: id,
        sessionId: session.id,
      },
    });

    return session.url;
  };

  handleWebhook = async (payload: Buffer, signature: string) => {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret_key,
    );

    // Handle the event
    switch (event.type) {
      // Occurs when a Checkout Session has been successfully completed.
      case "checkout.session.completed":
        const session: Stripe.Checkout.Session = event.data.object;

        const sessionId = session.id;
        const transactionId = session.payment_intent as string;

        const rentalRequestId = session.metadata?.rentalRequestId as string;
        const propertyId = session.metadata?.propertyId as string;

        const payment = await prisma.payment.findUnique({
          where: {
            sessionId,
          },
        });

        if (!payment) {
          throw new AppError(httpStatus.NOT_FOUND, "Payment record not found.");
        }

        if (payment?.status === PaymentStatus.COMPLETED) {
          return;
        }

        await prisma.$transaction(async (tx) => {
          // update payment
          await tx.payment.update({
            where: {
              sessionId,
            },
            data: {
              transactionId,
              status: PaymentStatus.COMPLETED,
              paidAt: new Date(),
            },
          });

          // update rentalRequest
          await tx.rentalRequest.update({
            where: {
              id: rentalRequestId,
            },
            data: {
              status: RentalRequestStatus.ACTIVE,
              completedAt: new Date(),
            },
          });

          // Mark property unavailable
          await tx.property.update({
            where: {
              id: propertyId,
            },
            data: {
              isAvailable: false,
            },
          });
        });

        break;
      // Occurs when a Checkout Session is expired.
      case "checkout.session.expired":
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  };
}

export const paymentService = new PaymentService();
