INSERT INTO branches (name, city)
SELECT             
    'branch' || gs AS name,
		'city' || gs AS city
FROM generate_series(1, 1000000) AS gs;


INSERT INTO accounts (branch_id, balance)
SELECT
    1 AS branch_id,             
    round((random() * 10000)::NUMERIC, 2) AS balance
FROM generate_series(1, 100);

CREATE TABLE IF NOT EXISTS customers (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	account_id BIGSERIAL REFERENCES accounts(id) NOT NULL,
	address TEXT NOT NULL
);

INSERT INTO customers (account_id, address)
SELECT
    1 AS branch_id,
		'Indonesia' AS address 
FROM generate_series(1, 100);


INSERT INTO loans (account_id, amount)
SELECT            
    1 AS account_id,
		round((random() * 100)::NUMERIC, 2) AS balance
FROM generate_series(1, 100);




-- SELECT * FROM customers;
-- SELECT * FROM accounts;
-- SELECT * FROM branches;
-- SELECT * FROM loans;
-- SELECT * FROM accounts INNER JOIN branches ON accounts.branch_id = branches.id WHERE accounts.balance > 5000;

-- UPDATE branches SET name = 'branch delapan' WHERE id = 8;

-- DELETE FROM loans WHERE id = 1
