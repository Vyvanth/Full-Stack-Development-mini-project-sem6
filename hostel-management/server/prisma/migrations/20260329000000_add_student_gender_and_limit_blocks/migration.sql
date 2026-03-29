-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'MALE';

-- Delete legacy Block C rooms to keep room allocation constrained to A/B
DELETE FROM "RoomAllocation"
WHERE "roomId" IN (SELECT "id" FROM "Room" WHERE "block" = 'C');

DELETE FROM "Room"
WHERE "block" = 'C';
