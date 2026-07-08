/*
  Warnings:

  - You are about to drop the `propertyamenities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "propertyamenities" DROP CONSTRAINT "propertyamenities_amenityId_fkey";

-- DropForeignKey
ALTER TABLE "propertyamenities" DROP CONSTRAINT "propertyamenities_propertyId_fkey";

-- DropTable
DROP TABLE "propertyamenities";

-- CreateTable
CREATE TABLE "property_amenities" (
    "amenityId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "property_amenities_pkey" PRIMARY KEY ("propertyId","amenityId")
);

-- AddForeignKey
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
