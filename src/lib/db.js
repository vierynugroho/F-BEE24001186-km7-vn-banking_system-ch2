import pg from 'pg';
const { Client } = pg;

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'ch3_challenge',
});

await client.connect();

export default client;
