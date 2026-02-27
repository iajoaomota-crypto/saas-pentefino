import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Connection string from environment variable or default
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:87e821b1d9d4b752471f@saas_backend_postgres:5432/saas_backend?sslmode=disable';

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
});

// Initialize database tables
export async function initDB() {
  console.log('Attempting to initialize database...');
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        email TEXT UNIQUE NOT NULL DEFAULT '',
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        active INTEGER DEFAULT 1,
        expiration_date TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verify if columns exist (for migration if table was created differently before)
    // Note: Postgres is more strict, but for a new VPS deploy this will likely be fresh.

    console.log('Database tables verified/created.');

    // Check if master user exists
    const masterCheck = await client.query('SELECT * FROM users WHERE username = $1', ['master']);
    if (masterCheck.rowCount === 0) {
      const hashedPassword = bcrypt.hashSync('master', 10);
      await client.query(
        'INSERT INTO users (username, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
        ['master', 'Admin Master', 'master@admin.com', hashedPassword, 'admin']
      );
      console.log('Master user created.');
    }

    client.release();
    return true;
  } catch (err: any) {
    console.error('FATAL ERROR: Error initializing PostgreSQL:', err.message);
    if (err.code) console.error('Error Code:', err.code);
    return false;
  }
}

export default pool;
