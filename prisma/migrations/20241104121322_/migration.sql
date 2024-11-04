-- DropForeignKey
ALTER TABLE "DataUsers" DROP CONSTRAINT "DataUsers_userId_fkey";

-- AddForeignKey
ALTER TABLE "DataUsers" ADD CONSTRAINT "DataUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
