-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "payment" DROP NOT NULL;
