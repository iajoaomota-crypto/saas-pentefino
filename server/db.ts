import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Define the database path
const dbPath = path.resolve(import.meta.dirname, 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE NOT NULL DEFAULT '',
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      active INTEGER DEFAULT 1,
      expiration_date DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Try to add new columns if the table already existed before this update
  try {
    db.exec(`ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT '';`);
    db.exec(`ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT '';`);
    // Add UNIQUE constraint to email if possible (SQLite ALTER TABLE has limitations)
    db.exec(`ALTER TABLE users ADD COLUMN expiration_date DATETIME DEFAULT NULL;`);
  } catch (e) {
    // Columns likely already exist
  }

  console.log('Database initialized successfully.');

  // Check if master user exists
  const master = db.prepare('SELECT * FROM users WHERE username = ?').get('master');
  if (!master) {
    const hashedPassword = bcrypt.hashSync('master', 10);
    db.prepare('INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
      .run('master', 'Admin Master', 'master@admin.com', hashedPassword, 'admin');
    console.log('Master user created.');
  }
}

export default db;
