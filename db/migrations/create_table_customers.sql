CREATE TABLE IF NOT EXISTS "customers" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(60) NOT NULL,
  "address" TEXT NOT NULL,
  "job" VARCHAR(255),
  "income" NUMERIC(10, 2) NOT NULL,
);

-- DROP TABLE customers

-- ALTER TABLE customers ADD deleted_at DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ALTER TABLE customers DROP deleted_at