/*
  Warnings:

  - You are about to drop the column `image` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "image",
ADD COLUMN     "image_url" TEXT;
