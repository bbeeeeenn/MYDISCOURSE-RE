/*
  Warnings:

  - You are about to drop the column `course` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `id_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `year_level` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_id_number_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "course",
DROP COLUMN "id_number",
DROP COLUMN "year_level";
