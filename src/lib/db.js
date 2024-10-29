import pg from 'pg';
const { Client } = pg;

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'ch3_challenge',
});

// Function to initialize database connection
async function connect() {
  try {
    await client.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit if we can't connect to the database
  }
}

// Initialize connection
connect();

export default client;
