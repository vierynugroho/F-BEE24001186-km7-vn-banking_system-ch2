--! ACCOUNT APPROVAL
CREATE OR REPLACE PROCEDURE approved ( 
	approved_account_id  INTEGER 
) LANGUAGE plpgsql 
AS $$
	BEGIN		
		IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = approved_account_id) THEN
			RAISE EXCEPTION 'Account with ID % not found!', approved_account_id;
		END IF;
		
		IF (SELECT approved FROM accounts WHERE id = approved_account_id) = TRUE THEN
			RAISE EXCEPTION 'Account with ID % is already approved!', approved_account_id;
		END IF;
		
		UPDATE accounts
		    SET approved = TRUE,
			    updated_at = CURRENT_TIMESTAMP
		    WHERE id = approved_account_id;
	END;
$$;

CALL approved(9);

--! TRANSFER 
CREATE OR REPLACE PROCEDURE transfer(
   sender INTEGER,
   receiver INTEGER, 
   amount DECIMAL
) LANGUAGE plpgsql 
AS $$
    DECLARE
        sender_balance DECIMAL;
        transaction_id UUID;
    BEGIN
		IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = sender) THEN
			RAISE EXCEPTION 'Sender with ID % not found!', sender;
		END IF;
		
		IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = receiver) THEN
			RAISE EXCEPTION 'Receiver with ID % not found!', receiver;
		END IF;
        
        IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = sender AND approved = TRUE) THEN
            RAISE EXCEPTION 'Transfer failed: Sender account with ID % is not approved.', sender;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = receiver AND approved = TRUE) THEN
            RAISE EXCEPTION 'Transfer failed: Receiver account with ID % is not approved.', receiver;
        END IF;

        IF amount <= 0 THEN
			RAISE EXCEPTION 'Transfer failed: Transfer amount must be greater than 0';
		END IF;

        SELECT balance INTO sender_balance 
            FROM accounts 
            WHERE id = sender;
				
		IF sender_balance < amount THEN
            RAISE EXCEPTION 'Transfer failed: Insufficient balance for sender with ID %.', sender;
        END IF;

        UPDATE accounts 
            SET balance = balance - amount 
            WHERE id = sender;

        UPDATE accounts 
            SET balance = balance + amount 
            WHERE id = receiver;

        transaction_id := gen_random_uuid();

        INSERT INTO transactions (id, account_id, type, transaction_at, amount, description)
        VALUES (
            transaction_id,  
            sender,          
            'TRANSFER'::TRANSACTION_TYPE,
            CURRENT_DATE,    
            amount,          
            'Transfer from sender with id: ' || sender || ' to receiver with id: ' || receiver
        );

    EXCEPTION
        WHEN OTHERS THEN
            RAISE; 
    END;
		
$$;

CALL transfer(1, 2, 999990);

--! DEPOSIT
CREATE OR REPLACE PROCEDURE deposit(
   account_id INTEGER,
   amount DECIMAL
) LANGUAGE plpgsql 
AS $$
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = account_id) THEN
			RAISE EXCEPTION 'Account with ID % not found!', account_id;
		END IF;

		IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND approved = TRUE) THEN
            RAISE EXCEPTION 'Deposit failed: account with ID % is not approved.', account_id;
        END IF;
		
        IF amount <= 0 THEN
			RAISE EXCEPTION 'Transfer failed: Transfer amount must be greater than 0';
		END IF;
	
		UPDATE accounts 
			SET balance = balance + amount 
			WHERE id = account_id;

			COMMIT;
	END;
$$;

CALL deposit(1000990,-10000);

--! WITHDRAWAL
CREATE OR REPLACE PROCEDURE withdrawal(
   account_id INTEGER,
   amount DECIMAL
) LANGUAGE plpgsql 
AS $$
    DECLARE
        account_balance DECIMAL;
    BEGIN
		IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = account_id) THEN
			RAISE EXCEPTION 'Account with ID % not found!', account_id;
		END IF;
		
        IF NOT EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND approved = TRUE) THEN
            RAISE EXCEPTION 'Withdrawal failed: Account with ID % is not approved.', account_id;
        END IF;

        IF amount <= 0 THEN
            RAISE EXCEPTION 'Withdrawal failed: Withdrawal amount must be greater than 0.';
        END IF;

        SELECT balance INTO account_balance FROM accounts WHERE id = account_id;

        IF account_balance - amount < 0 THEN
            RAISE EXCEPTION 'Withdrawal failed: Insufficient balance for account with ID %.', account_id;
        END IF;
        
        UPDATE accounts 
            SET balance = balance - amount 
            WHERE id = account_id;

        COMMIT;
    END;
$$;

CALL withdrawal(1, 900000000);


--! LOG TRANSACTIONS
WITH transaction_log AS (
    SELECT 
        trx.transaction_at AS transaction_at, 
        cust.name AS customer_name, 
				a.type AS accounts_type,
        SUM(trx.amount) AS trx_amount,
        ARRAY_AGG(trx.amount || ' at ' || trx.transaction_at::text) AS trx_details,
        trx.type AS transaction_type
    FROM 
        transactions trx 
    JOIN 
        accounts a ON trx.account_id = a.id
    JOIN 
        customers cust ON a.customer_id = cust.id
    WHERE 
        cust.id = 1 -- change id to get log trx by customers
    GROUP BY 
        a.type, trx.type, trx.transaction_at, cust.name 
    HAVING 
        SUM(trx.amount) > 0 
)
SELECT * 
FROM transaction_log
ORDER BY transaction_at DESC;