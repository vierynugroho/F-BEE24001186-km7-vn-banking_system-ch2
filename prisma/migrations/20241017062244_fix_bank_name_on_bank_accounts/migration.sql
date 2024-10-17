/*
  Warnings:

  - Changed the type of `bank_name` on the `bank_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BANK_NAME" AS ENUM ('BRI', 'BCA', 'MANDIRI', 'BNI', 'BSI', 'CIMB', 'PERMATA', 'DANAMON', 'OTHERS');

-- DropIndex
DROP INDEX "bank_accounts_bank_name_key";

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "bank_name",
ADD COLUMN     "bank_name" "BANK_NAME" NOT NULL;
