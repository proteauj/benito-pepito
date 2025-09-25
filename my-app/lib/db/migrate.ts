import { sql } from './client';

export async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Create migrations table
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Check if migration already executed
    const existingMigrations = await sql`SELECT name FROM migrations WHERE name = '001_initial_schema'`;
    if (existingMigrations.rows.length > 0) {
      console.log('✅ Migration already executed');
      return;
    }

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
        customer_email VARCHAR(255),
        product_ids JSONB NOT NULL,
        total_amount INTEGER NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create product_stock table
    await sql`
      CREATE TABLE IF NOT EXISTS product_stock (
        product_id VARCHAR(10) PRIMARY KEY,
        in_stock BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_stock_in_stock ON product_stock(in_stock)`;

    // Mark migration as executed
    await sql`INSERT INTO migrations (name) VALUES ('001_initial_schema')`;

    console.log('✅ Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
