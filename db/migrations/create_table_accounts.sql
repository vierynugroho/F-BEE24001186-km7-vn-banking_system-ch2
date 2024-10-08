DO 
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname iLike 'ACCOUNT_TYPE') THEN
        CREATE TYPE ACCOUNT_TYPE AS ENUM ('GIRO', 'SAVINGS');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "customer_id" BIGSERIAL NOT NULL REFERENCES customers(id),
  "email" VARCHAR(255) NOT NULL CONSTRAINT "unique_accounts_email" UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT FALSE,
  "type" ACCOUNT_TYPE NOT NULL,
  "balance" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DROP TABLE accounts

-- ALTER TABLE accounts ADD deleted_at DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ALTER TABLE accounts DROP deleted_at