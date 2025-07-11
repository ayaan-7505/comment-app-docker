import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // Set to true in production with proper SSL certs
  },
});

// Optional: Try connecting immediately to verify
(async () => {
  try {
    await db.query('SELECT 1');
    console.log(`✅ Connected to PostgreSQL at ${process.env.DATABASE_URL}`);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err);
    process.exit(1); // Exit the app if DB fails to connect
  }
})();

export { db };


