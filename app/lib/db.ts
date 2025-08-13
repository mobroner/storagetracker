import { Pool } from 'pg';

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  const g = global as typeof global & { pool: Pool };
  if (!g.pool) {
    g.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = g.pool;
}

export const db = pool;
