import httpStatus from "http-status";
import { RentalRequestStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { TCreateRentalPayload } from "./rental.interface";

class RentalService {
  getMyRentals = async (tenantId: string) => {
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
            propertyImages: {
              where: {
                isPrimary: true,
              },
              select: {
                id: true,
                url: true,
                isPrimary: true,
              },
            },
          },
        },
      },
    });
    return rentalRequests;
  };

  getRentalDetails = async (tenantId: string, rentalId: string) => {
    const rentalRequest = await prisma.rentalRequest.findFirst({
      where: {
        id: rentalId,
        tenantId: tenantId,
      },
      include: {
        property: true,
      },
    });

    return rentalRequest;
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

  updateRentalRequestStatus = async (
    landlordId: string,
    rentalId: string,
    status: string,
  ) => {
    // Find rental request and verify ownership
    const rentalRequest = await prisma.rentalRequest.findFirst({
      where: {
        id: rentalId,
        property: {
          landlordId: landlordId,
        },
      },
    });

    if (!rentalRequest) {
      throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
    }

    // Only pending requests can be processed
    if (rentalRequest.status !== RentalRequestStatus.PENDING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This rental request has already been processed.",
      );
    }

    // Prevent approved/active rentals for the same property
    if (status === RentalRequestStatus.APPROVED) {
      const existingApprovedRequest = await prisma.rentalRequest.findFirst({
        where: {
          propertyId: rentalRequest.propertyId,
          status: {
            in: [RentalRequestStatus.APPROVED, RentalRequestStatus.ACTIVE],
          },
        },
      });

      if (existingApprovedRequest) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "This property already has an approved or active rental request.",
        );
      }
    }

    const updatedRentalRequest = await prisma.rentalRequest.update({
      where: {
        id: rentalId,
      },
      data: {
        status:
          status === RentalRequestStatus.APPROVED
            ? RentalRequestStatus.APPROVED
            : RentalRequestStatus.REJECTED,
        approvedAt: status === RentalRequestStatus.APPROVED ? new Date() : null,
        rejectedAt: status === RentalRequestStatus.REJECTED ? new Date() : null,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedRentalRequest;
  };
}

export const rentalService = new RentalService();
