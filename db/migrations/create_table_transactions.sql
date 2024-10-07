DO 
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname iLike 'TRANSACTION_TYPE') THEN
        CREATE TYPE TRANSACTION_TYPE AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" UUID NOT NULL PRIMARY KEY,
  "account_id" BIGSERIAL NOT NULL REFERENCES accounts(id),
  "type" TRANSACTION_TYPE NOT NULL,
  "transaction_at" DATE NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL,
  "description" TEXT
);

-- DROP TABLE transactions

-- ALTER TABLE transactions ADD deleted_at DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ALTER TABLE transactions DROP deleted_at

-- CREATE INDEX idx_transactions_type ON transactions(type);
-- DROP INDEX idx_transactions_type;

-- EXPLAIN ANALYZE SELECT * FROM transactions WHERE type = 'DEPOSIT'::TRANSACTION_TYPE AND amount < 5000; -- no index: planning time: 0.139ms | exc time: 337.748ms

-- EXPLAIN ANALYZE SELECT * FROM transactions WHERE type = 'DEPOSIT'::TRANSACTION_TYPE AND amount < 5000; -- index: | planning time: 0.127ms | exc time: 132.977ms