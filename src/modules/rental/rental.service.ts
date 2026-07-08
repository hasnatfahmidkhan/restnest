import httpStatus from "http-status";
import { RentalRequestStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { TCreateRentalPayload } from "./rental.interface";

class RentalService {
  getMyRentals  = async (tenantId: string) => {
    const rentalRequests = await prisma.rentalRequest.findMany({
      where: {
        tenantId: tenantId,
      },
      select: {
        id: true,
        status: true,
        moveInDate: true,
        leaseMonths: true,
        endDate: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
            rentPrice: true,
            city: true,
            division: true,
          },
        },
      },
    });
    return rentalRequests;
  };
  createRentalRequest = async (
    payload: TCreateRentalPayload,
    tenantId: string,
  ) => {
    const property = await prisma.property.findUnique({
      where: {
        id: payload.propertyId,
      },
    });

    if (!property) {
      throw new AppError(httpStatus.NOT_FOUND, "Property not found");
    }

    // Check property availability
    if (!property.isAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Property is not available for rent",
      );
    }

    // Prevent landlord from requesting own property
    if (property.landlordId === tenantId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Landlord cannot request their own property",
      );
    }

    // Prevent duplicate requests
    const existingRequest = await prisma.rentalRequest.findFirst({
      where: {
        propertyId: payload.propertyId,
        tenantId: tenantId,
        status: {
          in: [
            RentalRequestStatus.PENDING,
            RentalRequestStatus.APPROVED,
            RentalRequestStatus.ACTIVE,
          ],
        },
      },
    });

    if (existingRequest) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You have already made a rental request for this property",
      );
    }

    // Calculate end date
    const endDate = new Date(payload.moveInDate);
    endDate.setMonth(endDate.getMonth() + payload.leaseMonths); // Add lease duration in months

    // Create rental request
    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        tenantId: tenantId,
        propertyId: payload.propertyId,
        moveInDate: payload.moveInDate,
        leaseMonths: payload.leaseMonths,
        endDate: endDate,
        ...(payload.message && { message: payload.message }),
      },
    });
    return rentalRequest;
  };
}

export const rentalService = new RentalService();
