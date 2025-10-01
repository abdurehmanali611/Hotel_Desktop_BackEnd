-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "tableNo" INTEGER NOT NULL,
    "waiterName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payment" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
