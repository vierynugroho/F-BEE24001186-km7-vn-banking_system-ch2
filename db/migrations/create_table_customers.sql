CREATE TABLE "customers" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(60) NOT NULL,
  "address" TEXT NOT NULL,
  "job" VARCHAR(255),
  "income" DECIMAL
);
