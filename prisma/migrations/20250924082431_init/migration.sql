/*
  Warnings:

  - Made the column `hotelName` on table `Item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hotelName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hotelName` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Item" ALTER COLUMN "hotelName" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "hotelName" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "hotelName" SET NOT NULL;
