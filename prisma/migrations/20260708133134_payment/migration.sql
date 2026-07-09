/*
  Warnings:

  - You are about to drop the column `paidAt` on the `rental_requests` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "rental_requests" DROP COLUMN "paidAt";

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "rentalRequestId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentIntent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_rentalRequestId_key" ON "payments"("rentalRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentIntent_key" ON "payments"("paymentIntent");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_rentalRequestId_fkey" FOREIGN KEY ("rentalRequestId") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
