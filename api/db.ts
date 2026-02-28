import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Connection string from environment variable or default
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  'postgres://postgres:87e821b1d9d4b752471f@saas_backend_postgres:5432/saas_backend?sslmode=disable';

console.log('DB Config:', {
  hasUrl: !!connectionString,
  urlStart: connectionString ? connectionString.substring(0, 20) + '...' : 'none',
  isVercel: !!process.env.VERCEL
});

const pool = new Pool({
  connectionString,
  ssl: (connectionString.includes('sslmode=disable')) ? false : { rejectUnauthorized: false }
});

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Initialize database tables
export async function initDB() {
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    console.log('Attempting to initialize database...');
    let client;
    try {
      client = await pool.connect();
      console.log('Connected to PostgreSQL successfully.');

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          name TEXT,
          email TEXT UNIQUE,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          active INTEGER DEFAULT 1,
          expiration_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL, -- 'income' | 'expense'
          "desc" TEXT NOT NULL,
          amount NUMERIC(15, 2) NOT NULL,
          category TEXT,
          date TEXT, -- format DD/MM/YYYY
          barber TEXT,
          revenue_type TEXT, -- 'services' | 'products'
          expense_type TEXT, -- 'professional' | 'personal'
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL, -- 'fixas' | 'variaveis'
          name TEXT NOT NULL,
          amount NUMERIC(15, 2) NOT NULL,
          due_date TEXT, -- format DD/MM/YYYY
          status TEXT DEFAULT 'pending', -- 'pending' | 'paid'
          paid_at TEXT,
          recurrence TEXT, -- 'mensal' | 'unitaria' | etc
          variable_type TEXT, -- 'recorrente' | 'unitaria'
          reference_month TEXT, -- format M/YYYY
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS closings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          date TEXT NOT NULL, -- format DD/MM/YYYY
          total_amount NUMERIC(15, 2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create master user if not exists
      const masterCheck = await client.query('SELECT id FROM users WHERE username = $1', ['master']);
      if (masterCheck.rowCount === 0) {
        const masterPassword = bcrypt.hashSync('master', 10);
        await client.query(`
          INSERT INTO users (username, password, name, email, role, active)
          VALUES ('master', $1, 'Administrador Master', 'master@pentefino.com', 'admin', 1)
        `, [masterPassword]);
        console.log('Master user created.');
      }

      console.log('Database tables initialized/verified.');
      isInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
      throw err;
    } finally {
      if (client) client.release();
    }
  })();

  return initializationPromise;
}

// Wrapper to ensure DB is initialized before any query
export const db = {
  query: async (text: string, params?: any[]) => {
    await initDB();
    return await pool.query(text, params);
  }
};

export default db;
