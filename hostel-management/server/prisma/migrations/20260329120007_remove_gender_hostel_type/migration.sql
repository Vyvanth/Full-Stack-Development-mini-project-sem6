/*
  Warnings:

  - You are about to drop the column `hostelType` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "hostelType";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gender";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "HostelType";
