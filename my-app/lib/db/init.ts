import { DatabaseService } from './service';
import { products } from '../../data/products';

export async function initializeProductStock() {
  console.log('🔄 Initializing product stock...');

  try {
    // Update stock for all products
    const productIds = products.map(p => p.id);
    await DatabaseService.updateMultipleProductStock(productIds, true);

    console.log(`✅ Initialized stock for ${productIds.length} products`);
  } catch (error) {
    console.error('❌ Failed to initialize product stock:', error);
    throw error;
  }
}
