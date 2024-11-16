-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "identity_number" DROP NOT NULL,
ALTER COLUMN "identity_number" SET DEFAULT '',
ALTER COLUMN "address" SET DEFAULT 'Indonesia',
ALTER COLUMN "identity_type" SET DEFAULT 'KTP';
