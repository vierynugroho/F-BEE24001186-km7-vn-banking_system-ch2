-- insert customers data
INSERT INTO customers (name, address, job, income)
SELECT 
    'Customer_' || row_number() OVER () AS name, 
    'City_' || (random() * 10)::numeric(10) AS address,
    CASE floor(random() * 3)
        WHEN 0 THEN 'Programmer'
        WHEN 1 THEN 'Designer'
        ELSE 'Analyst'
    END AS job,
    (random() * 100000)::numeric(10,2) AS income
FROM generate_series(1, 100);

-- insert accounts data
INSERT INTO accounts (customer_id, email, password, approved, type, balance, created_at, updated_at)
SELECT
  c.id AS customer_id,
  c.name || '@example.com' AS email,
  md5(c.name || c.address)::text AS password,
  CASE WHEN random() < 0.5 THEN TRUE ELSE FALSE END AS approved,
  CASE WHEN random() < 0.5 THEN 'GIRO' ELSE 'SAVINGS' END::ACCOUNT_TYPE AS type,
  (random() * 100000)::numeric(10, 2) AS balance,
  CURRENT_TIMESTAMP AS created_at,
  CURRENT_TIMESTAMP AS updated_at
FROM customers c;


-- insert transactions data
INSERT INTO transactions (id, account_id, type, transaction_at, amount, description)
SELECT
  gen_random_uuid() AS id,
  accounts.id AS account_id,  -- Mengambil account_id acak dari tabel accounts
  CASE floor(random() * 3)
    WHEN 0 THEN 'DEPOSIT'
    WHEN 1 THEN 'WITHDRAWAL'
    ELSE 'TRANSFER'
  END::TRANSACTION_TYPE AS type,
  CURRENT_DATE - floor(random() * 30)::int AS transaction_at, 
  (random() * 10000)::numeric(10, 2) AS amount,
  'Sample transaction ' || floor(random() * 100)::text AS description 
FROM generate_series(1, 1000000)
JOIN (SELECT id FROM accounts ORDER BY random()) accounts ON TRUE  -- Join acak dengan tabel accounts
LIMIT 1000000;  -- Batasi jumlah hasil ke 1 juta baris
