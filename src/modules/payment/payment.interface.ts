import { Prisma } from "../../../generated/prisma/client";

export type RentalRequestWithProperty = Prisma.RentalRequestGetPayload<{
  include: {
    property: {
      include: {
        propertyImages: {
          select: {
            url: true;
          };
        };
      };
    };
  };
}>;


