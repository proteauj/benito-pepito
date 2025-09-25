import { sql } from '@vercel/postgres';
import { runMigrations } from '../../../../lib/db/migrate';
import { initializeProductStock } from '../../../../lib/db/init';

export default async function handler() {
  try {
    // Initialize database on startup
    await runMigrations();
    await initializeProductStock();

    return new Response('Database initialized successfully', { status: 200 });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return new Response('Database initialization failed', { status: 500 });
  }
}
