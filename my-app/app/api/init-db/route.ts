import { NextRequest } from 'next/server';

// Try to import database modules - will fail in environments without database
let runMigrations: any = null;
let initializeProductStock: any = null;

try {
  const migrateModule = require('../../../lib/db/migrate');
  runMigrations = migrateModule.runMigrations;
} catch (error) {
  console.log('Migration module not available');
}

try {
  const initModule = require('../../../lib/db/init');
  initializeProductStock = initModule.initializeProductStock;
} catch (error) {
  console.log('Init module not available');
}

export async function GET(request: NextRequest) {
  try {
    // Check if database modules are available
    if (!runMigrations || !initializeProductStock) {
      return new Response('Database modules not available', { status: 503 });
    }

    // Initialize database on startup
    await runMigrations();
    await initializeProductStock();

    return new Response('Database initialized successfully', { status: 200 });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return new Response('Database initialization failed', { status: 500 });
  }
}
