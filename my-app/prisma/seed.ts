import { PrismaClient } from '@prisma/client'
import { products } from '../app/data/products.js'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding product stock data...')

  // Insert product stock data
  for (const product of products) {
    await prisma.productStock.upsert({
      where: { productId: product.id },
      update: { inStock: product.inStock },
      create: {
        productId: product.id,
        inStock: product.inStock,
      },
    })
  }

  console.log('✅ Product stock data seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
