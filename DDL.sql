-- CREATE TABLE IF NOT EXISTS branches (
-- 	id BIGSERIAL PRIMARY KEY NOT NULL,
-- 	name VARCHAR(50) NOT NULL,
-- 	city VARCHAR(50) NOT NULL
-- );
-- 
-- CREATE TABLE IF NOT EXISTS accounts (
-- 	id BIGSERIAL PRIMARY KEY NOT NULL,
-- 	branch_id BIGSERIAL NOT NULL REFERENCES branches(id),
-- 	balance DECIMAL NOT NULL
-- );
-- 
-- CREATE TABLE IF NOT EXISTS customers (
-- 	id BIGSERIAL PRIMARY KEY NOT NULL,
-- 	account_id BIGSERIAL REFERENCES accounts(id) NOT NULL,
-- 	address TEXT NOT NULL
-- );
-- 
-- CREATE TABLE IF NOT EXISTS loans (
-- 	id BIGSERIAL PRIMARY KEY NOT NULL,
-- 	account_id BIGSERIAL REFERENCES accounts(id) NOT NULL,
-- 	amount DECIMAL NOT NULL
-- );
-- 
-- DROP TABLE loans;
-- DROP TABLE customers;
-- DROP TABLE accounts;
-- DROP TABLE branches;

-- ALTER TABLE branches ADD created_at DATE NOT NULL DEFAULT CURRENT_TIMESTAMP

-- CREATE INDEX idx_branches_city ON branches(city);
-- DROP INDEX idx_branches_city;

-- EXPLAIN ANALYZE SELECT * FROM branches WHERE city iLIKE 'city' AND id < 100; -- no index: elapsed time: 0.661s | planning time: 145.961ms
EXPLAIN ANALYZE SELECT * FROM branches WHERE city = 'Jakarta' AND id < 5_000; -- index: elapsed time: 0.098s | planning time: 90.326ms


