/*
  Warnings:

  - You are about to drop the column `paymentIntent` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_paymentIntent_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentIntent";
