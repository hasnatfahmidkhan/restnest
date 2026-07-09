/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_sessionId_key" ON "payments"("sessionId");

-- CreateIndex
CREATE INDEX "payments_rentalRequestId_idx" ON "payments"("rentalRequestId");

-- CreateIndex
CREATE INDEX "payments_sessionId_idx" ON "payments"("sessionId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");
