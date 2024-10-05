DO 
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "account_id" BIGSERIAL NOT NULL REFERENCES accounts(id),
  "type" TRANSACTION_TYPE NOT NULL,
  "transaction_at" DATE NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL,
  "description" TEXT
);