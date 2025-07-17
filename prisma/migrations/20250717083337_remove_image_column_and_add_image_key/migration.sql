/*
  Warnings:

  - You are about to drop the column `image` on the `Meal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meal" DROP COLUMN "image",
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;
