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
import type { RentalRequestWithProperty } from "./payment.interface";

class PaymentService {
  private createCheckoutSession = async (
    rentalRequest: RentalRequestWithProperty,
    email: string,
    tenantId: string,
  ) => {
    const imageUrls = rentalRequest.property.propertyImages.map(
      (img) => img.url,
    );
    return await stripe.checkout.sessions.create({
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
              ...(imageUrls.length > 0 && { images: imageUrls }),
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

      success_url: `${config.app_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app_url}/cancel`,
      metadata: {
        rentalRequestId: rentalRequest.id,
        tenantId,
        propertyId: rentalRequest.propertyId,
      },
    });
  };

  createPaymentSession = async (
    id: string,
    tenantId: string,
    email: string,
  ) => {
    // check rental request exists
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: {
        id,
      },
      include: {
        property: {
          include: {
            propertyImages: {
              select: {
                url: true,
              },
            },
          },
        },
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
    if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment can only be made for approved rental requests",
      );
    }

    // check if payment already exists for this rental request
    const existingPayment = await prisma.payment.findUnique({
      where: {
        rentalRequestId: id,
      },
    });

    if (existingPayment?.status === PaymentStatus.COMPLETED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment has already completed for this rental request",
      );
    }

    if (!existingPayment) {
      // create checkout session
      const session = await this.createCheckoutSession(
        rentalRequest,
        email,
        tenantId,
      );

      await prisma.payment.create({
        data: {
          amount: rentalRequest.property.rentPrice,
          rentalRequestId: id,
          sessionId: session.id,
        },
      });

      return session.url;
    }

    if (
      existingPayment &&
      (existingPayment.status === PaymentStatus.FAILED ||
        existingPayment.status === PaymentStatus.PENDING)
    ) {
      const session = await this.createCheckoutSession(
        rentalRequest,
        email,
        tenantId,
      );

      await prisma.payment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          // Every retry creates a new Stripe Checkout Session,
          // so replace the previous sessionId.
          sessionId: session.id,
          status: PaymentStatus.PENDING,
          transactionId: null,
          paidAt: null,
        },
      });
      return session.url;
    }
  };

  private handleCheckoutCompleted = async (
    session: Stripe.Checkout.Session,
  ) => {
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
  };

  private handleCheckoutExpired = async (session: Stripe.Checkout.Session) => {
    const sessionId = session.id;

    const payment = await prisma.payment.findUnique({
      where: {
        sessionId,
      },
    });

    if (!payment) {
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return;
    }

    await prisma.payment.update({
      where: {
        sessionId,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
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
      case "checkout.session.completed": {
        const session: Stripe.Checkout.Session = event.data.object;
        await this.handleCheckoutCompleted(session);
        break;
      }
      // Occurs when a Checkout Session is expired.
      case "checkout.session.expired": {
        const session: Stripe.Checkout.Session = event.data.object;
        await this.handleCheckoutExpired(session);
        break;
      }
      default:
        // Unexpected event type
        console.log(`Error from webhook, Unhandled event type ${event.type}.`);
    }
  };

  // get payment history
  getPaymentHistory = async (tenantId: string) => {
    const payments = await prisma.payment.findMany({
      where: {
        rentalRequest: {
          tenantId,
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paidAt: true,
        transactionId: true,
        rentalRequest: {
          select: {
            status: true,
            moveInDate: true,
            endDate: true,
            property: {
              select: {
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
    });
    return payments;
  };

  // get payment details
  getPaymentDetails = async (tenantId: string, id: string) => {
    const payment = await prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        rentalRequest: {
          include: {
            property: {
              include: {
                landlord: true,
              },
            },
          },
        },
      },
    });
    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }
    // check the ownership of the payment
    if (payment.rentalRequest.tenantId !== tenantId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Forbidden access, you have not permission to access",
      );
    }

    return payment;
  };
}

export const paymentService = new PaymentService();
