import { sql } from './client';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'migrations');

  try {
    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Get executed migrations
    const executedMigrations = await sql`SELECT name FROM migrations`;
    const executedNames = new Set(executedMigrations.rows.map(row => row.name));

    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      if (executedNames.has(file)) {
        console.log(`✅ Migration ${file} already executed`);
        continue;
      }

      console.log(`🚀 Executing migration ${file}...`);

      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      // Execute migration
      await sql.begin(async sql => {
        await sql.unsafe(migrationSQL);
        await sql`INSERT INTO migrations (name) VALUES (${file})`;
      });

      console.log(`✅ Migration ${file} executed successfully`);
    }

    console.log('🎉 All migrations completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
