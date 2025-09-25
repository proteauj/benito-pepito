import { prisma } from './client';

export async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Check if migration already executed
    const existingMigrations = await prisma.migration.findMany({
      where: { name: '001_initial_schema' }
    });

    if (existingMigrations.length > 0) {
      console.log('✅ Migration already executed');
      return;
    }

    // Create indexes if they don't exist
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_product_stock_in_stock ON product_stock(in_stock)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_customer_address_type ON customer_addresses(type)`;
    } catch (error) {
      // Indexes might already exist, continue
      console.log('ℹ️ Some indexes might already exist');
    }

    // Mark migration as executed
    await prisma.migration.create({
      data: {
        name: '001_initial_schema',
      }
    });

    console.log('✅ Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
