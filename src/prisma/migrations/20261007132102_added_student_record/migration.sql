/*
  Warnings:

  - The `occupants` column on the `reservations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "occupants",
ADD COLUMN     "occupants" TEXT[];

-- CreateTable
CREATE TABLE "StudentRecord" (
    "id_number" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "middlename" TEXT,
    "lastname" TEXT NOT NULL,
    "yearlevel" INTEGER NOT NULL,
    "college" TEXT NOT NULL,
    "program" TEXT NOT NULL,

    CONSTRAINT "StudentRecord_pkey" PRIMARY KEY ("id_number")
);
