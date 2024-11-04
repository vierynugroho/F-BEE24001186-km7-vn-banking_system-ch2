/*
  Warnings:

  - You are about to drop the `UserDatas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserDatas" DROP CONSTRAINT "UserDatas_userId_fkey";

-- DropTable
DROP TABLE "UserDatas";

-- CreateTable
CREATE TABLE "DataUsers" (
    "id" SERIAL NOT NULL,
    "file_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DataUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataUsers_file_id_key" ON "DataUsers"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "DataUsers_file_url_key" ON "DataUsers"("file_url");

-- CreateIndex
CREATE UNIQUE INDEX "DataUsers_userId_key" ON "DataUsers"("userId");

-- AddForeignKey
ALTER TABLE "DataUsers" ADD CONSTRAINT "DataUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
