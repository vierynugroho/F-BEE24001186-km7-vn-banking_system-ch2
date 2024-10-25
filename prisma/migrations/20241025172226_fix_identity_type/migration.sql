/*
  Warnings:

  - Changed the type of `identity_type` on the `profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IDENTITY_TYPE" AS ENUM ('KTP', 'SIM', 'KTM', 'NPWP', 'PASSPORT', 'OTHERS');

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "identity_type",
ADD COLUMN     "identity_type" "IDENTITY_TYPE" NOT NULL;

-- DropEnum
DROP TYPE "USER_TYPE";
