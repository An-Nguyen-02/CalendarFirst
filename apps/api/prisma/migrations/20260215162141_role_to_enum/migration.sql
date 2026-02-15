/*
  Warnings:

  - Changed the type of `role` on the `org_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('ORGANIZER', 'ADMIN');

-- AlterTable
ALTER TABLE "org_members"
  ALTER COLUMN "role" TYPE "OrgRole"
  USING (
    CASE
      WHEN UPPER("role") = 'ADMIN' THEN 'ADMIN'::"OrgRole"
      ELSE 'ORGANIZER'::"OrgRole"
    END
  );

-- CreateIndex
CREATE INDEX "org_members_user_id_idx" ON "org_members"("user_id");
