-- CreateTable
CREATE TABLE "UserDatas" (
    "id" SERIAL NOT NULL,
    "file_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usersId" INTEGER NOT NULL,

    CONSTRAINT "UserDatas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDatas_file_id_key" ON "UserDatas"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDatas_file_url_key" ON "UserDatas"("file_url");

-- AddForeignKey
ALTER TABLE "UserDatas" ADD CONSTRAINT "UserDatas_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
