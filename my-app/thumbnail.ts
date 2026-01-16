#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
const sharp = require('sharp') as typeof import('sharp');

// ⚡ Import du tableau Product
import { products as productsArray } from './app/data/products'; // adapte selon ton dossier

// ---------------- CONFIG ----------------
const INPUT_DIR = path.join(process.cwd(), 'public/images');       
const OUTPUT_DIR = path.join(INPUT_DIR, 'thumb'); // public/images/thumb
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Fonction pour créer une miniature
async function createThumbnail(inputFile: string, outputFile: string) {
  await sharp(inputFile)
    .resize(300)           // largeur max 300px
    .jpeg({ quality: 60 }) // compression JPEG
    .toFile(outputFile);
}

// Script principal
async function main() {
  console.log('🚀 Génération des miniatures…');

  for (const product of productsArray) {
    if (!product.image) continue;

    const imageName = path.basename(product.image);
    const inputPath = path.join(INPUT_DIR, imageName);
    const outputPath = path.join(OUTPUT_DIR, imageName);

    try {
      if (!fs.existsSync(inputPath)) {
        console.warn(`⚠️ Image manquante pour ${product.id}: ${inputPath}`);
        // On peut quand même mettre la miniature égale à l'image full pour éviter undefined
        product.imageThumbnail = product.image;
        continue;
      }

      // Génère la miniature
      await createThumbnail(inputPath, outputPath);

      // Ajoute la propriété imageThumbnail
      product.imageThumbnail = `/images/thumb/${imageName}`;
    } catch (err) {
      console.error(`Erreur pour ${product.id}:`, err);
      // fallback
      product.imageThumbnail = product.image;
    }
  }

  // ⚡ Réécriture du fichier TS
  const content = `import { Product } from '@/types';\n\nexport const products: Product[] = ${JSON.stringify(productsArray, null, 2)};\n`;
  const outputPathTS = path.join(process.cwd(), 'app/data/products.ts'); // adapte ton dossier
  fs.writeFileSync(outputPathTS, content, 'utf-8');

  console.log('✅ Miniatures générées et fichier products.ts mis à jour !');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});