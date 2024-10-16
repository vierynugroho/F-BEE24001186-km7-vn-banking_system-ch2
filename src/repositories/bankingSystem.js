import client from '../lib/db.js';

export class BankingSystemRepository {
  static async getAccount(accountID) {
    const query = await client.query(`SELECT * FROM accounts WHERE id = $1`, [
      accountID,
    ]);

    const account = query.rows.length === 0 ? false : true;

    return account;
  }

  static async insufficientCheck(accountID, amount) {
    const query = await client.query(
      `SELECT balance FROM accounts WHERE id = $1`,
      [accountID],
    );
    const balance = query.rows[0].balance;

    const insufficient = amount > balance ? true : false;

    return insufficient;
  }

  static async getBalance(accountID) {
    const query = await client.query(
      `SELECT balance FROM accounts WHERE id = $1`,
      [accountID],
    );

    const balance = query.rows[0].balance;
    return balance;
  }

  static async updateBalance(accountID, newBalance) {
    const query = await client.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2 RETURNING *',
      [newBalance, accountID],
    );

    const senderNewBalance = query.rows[0].balance;

    return senderNewBalance;
  }

  static async log(accountID) {
    const raw = `WITH transaction_log AS (
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
          cust.id = $1
        GROUP BY 
          a.type, trx.type, trx.transaction_at, cust.name 
        HAVING 
          SUM(trx.amount) > 0 
      )
      SELECT * 
      FROM transaction_log
      ORDER BY transaction_at DESC;`;

    const query = await client.query(raw, [accountID]);

    const log = query.rows;

    return log;
  }
}
