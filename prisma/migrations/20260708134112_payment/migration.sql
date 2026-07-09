-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "paymentIntent" DROP NOT NULL;
