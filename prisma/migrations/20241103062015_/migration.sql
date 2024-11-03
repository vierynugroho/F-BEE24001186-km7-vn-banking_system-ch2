/*
  Warnings:

  - You are about to drop the column `usersId` on the `UserDatas` table. All the data in the column will be lost.
  - Added the required column `userId` to the `UserDatas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_usersId_fkey";

-- AlterTable
ALTER TABLE "UserDatas" DROP COLUMN "usersId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserDatas" ADD CONSTRAINT "UserDatas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
