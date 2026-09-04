/*
  Warnings:

  - Made the column `location` on table `rooms` required. This step will fail if there are existing NULL values in that column.
  - Made the column `capacity` on table `rooms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "capacity" SET NOT NULL;
