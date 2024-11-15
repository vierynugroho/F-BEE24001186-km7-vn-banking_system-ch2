-- AlterTable
ALTER TABLE "users" ADD COLUMN     "OTPToken" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "secretToken" TEXT;
