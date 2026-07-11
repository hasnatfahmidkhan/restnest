import cron from "node-cron";
import { RentalRequestStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
export const rentalCompletionCorn = () => {
  // Everyday at night
  //  ┌──────── minute (0)
  // │ ┌────── hour (0)
  // │ │ ┌──── day of month (*)
  // │ │ │ ┌── month (*)
  // │ │ │ │ ┌─ day of week (*)
  // │ │ │ │ │
  // 0 0 * * *
  cron.schedule("0 0 * * *", async () => {
    console.log("Running rental completion cron...");

    try {
      const expiredRentals = await prisma.rentalRequest.findMany({
        where: {
          status: RentalRequestStatus.ACTIVE,
          endDate: {
            lte: new Date(),
          },
        },
        select: {
          id: true,
          propertyId: true,
        },
      });

      if (!expiredRentals.length) return;

      const rentalIds = expiredRentals.map((rental) => rental.id);
      const propertyIds = expiredRentals.map((rental) => rental.propertyId);

      await prisma.$transaction(async (tx) => {
        await tx.rentalRequest.updateMany({
          where: {
            id: {
              in: rentalIds,
            },
          },
          data: {
            status: RentalRequestStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        await tx.property.updateMany({
          where: {
            id: {
              in: propertyIds,
            },
          },
          data: {
            isAvailable: true,
          },
        });
      });
    } catch (err) {
      console.error("Rental cron failed:", err);
    }
  });
};
