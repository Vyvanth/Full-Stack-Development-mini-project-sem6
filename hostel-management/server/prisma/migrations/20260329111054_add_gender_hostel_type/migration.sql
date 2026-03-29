-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "HostelType" AS ENUM ('BOYS', 'GIRLS', 'COMMON');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "hostelType" "HostelType" NOT NULL DEFAULT 'BOYS';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'MALE';
