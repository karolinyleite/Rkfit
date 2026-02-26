import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Detect environment
const isPostgres = !!process.env.POSTGRES_URL;

let pool: Pool | null = null;
let sqlite: Database.Database | null = null;

if (isPostgres) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Local SQLite Fallback
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  sqlite = new Database(path.join(dataDir, 'nutrition.db'));
}

// Helper to query the database (Adapter Pattern)
export const query = async (text: string, params: any[] = []) => {
  if (isPostgres && pool) {
    return await pool.query(text, params);
  } else if (sqlite) {
    // 1. Convert Postgres syntax ($1, $2) to SQLite syntax (?, ?)
    const sqliteText = text.replace(/\$\d+/g, '?');
    
    // 2. Prepare statement
    const stmt = sqlite.prepare(sqliteText);
    
    // 3. Determine execution mode
    // If it's a SELECT or has RETURNING, we expect rows.
    const returnsData = /^\s*SELECT/i.test(sqliteText) || /RETURNING/i.test(sqliteText);
    
    try {
      if (returnsData) {
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes };
      }
    } catch (err: any) {
      // Handle unique constraint violation code mapping
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        err.code = '23505'; // Map to Postgres unique violation code
      }
      throw err;
    }
  }
  throw new Error('Database not initialized');
};

// Initialize tables (Dialect-specific)
export const initDb = async () => {
  try {
    if (isPostgres) {
      // Postgres Schema
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          calories INTEGER NOT NULL,
          protein INTEGER DEFAULT 0,
          carbs INTEGER DEFAULT 0,
          fats INTEGER DEFAULT 0,
          time TEXT NOT NULL,
          prep_method TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS stats (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          weight DECIMAL(5,2) DEFAULT 78.50,
          goal_weight DECIMAL(5,2) DEFAULT 72.00,
          daily_calorie_goal INTEGER DEFAULT 2200,
          streak INTEGER DEFAULT 0,
          junk_food_free_days INTEGER DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      // SQLite Schema
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          user_id INTEGER,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          calories INTEGER NOT NULL,
          protein INTEGER DEFAULT 0,
          carbs INTEGER DEFAULT 0,
          fats INTEGER DEFAULT 0,
          time TEXT NOT NULL,
          prep_method TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS stats (
          user_id INTEGER PRIMARY KEY,
          weight REAL DEFAULT 78.5,
          goal_weight REAL DEFAULT 72.0,
          daily_calorie_goal INTEGER DEFAULT 2200,
          streak INTEGER DEFAULT 0,
          junk_food_free_days INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
    }
    console.log(`Database initialized successfully (${isPostgres ? 'Postgres' : 'SQLite'})`);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

export default { query, initDb };
