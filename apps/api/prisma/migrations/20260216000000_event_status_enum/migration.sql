-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "events"
  ALTER COLUMN "status" TYPE "EventStatus"
  USING "status"::"EventStatus";
