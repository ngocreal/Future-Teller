import { createPool } from '@vercel/postgres';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default pool;