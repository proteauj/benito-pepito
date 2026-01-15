import Stripe from 'stripe';
import { products } from '../app/data/products';

async function syncStripeProducts() {
  console.log('🔄 Synchronisation des produits Stripe...');

  // Check if Stripe key is available
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY non configurée dans .env.local');
    console.log('💡 Ajoutez vos clés Stripe dans le fichier .env.local :');
    console.log('   STRIPE_SECRET_KEY=sk_test_votre_clé');
    console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_votre_clé');
    console.log('   STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret');
    console.log('');
    console.log('📋 Étapes à suivre :');
    console.log('1. Allez sur https://dashboard.stripe.com');
    console.log('2. Section "Developers" → "API keys"');
    console.log('3. Copiez les clés de test');
    console.log('4. Ajoutez-les dans .env.local');
    console.log('5. Relancez ce script');
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil'
  });

  for (const product of products) {
    try {
      // Chercher le produit par nom
      const existingProducts = await stripe.products.search({
        query: `name:"${product.title}"`,
      });

      if (existingProducts.data.length > 0) {
        const stripeProduct = existingProducts.data[0];
        console.log(`📦 Produit trouvé: ${product.title} (${stripeProduct.id})`);

        // Vérifier les métadonnées actuelles
        const currentMetadata = stripeProduct.metadata || {};
        const needsUpdate = !currentMetadata.productId;

        if (needsUpdate) {
          // Mettre à jour les métadonnées
          await stripe.products.update(stripeProduct.id, {
            metadata: {
              productId: product.id,
              category: product.category
            }
          });

          console.log(`✅ Métadonnées mises à jour pour ${product.title}`);
        } else {
          console.log(`✅ Métadonnées déjà présentes pour ${product.title}`);
        }

        // Vérifier les prix associés
        const prices = await stripe.prices.list({ product: stripeProduct.id });

        for (const price of prices.data) {
          if (price.unit_amount !== Math.round(product.price * 100)) {
            console.log(`💰 Prix à corriger pour ${product.title}: ${price.unit_amount} -> ${Math.round(product.price * 100)}`);

            // Désactiver l'ancien prix
            await stripe.prices.update(price.id, { active: false });

            // Créer un nouveau prix
            await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: Math.round(product.price * 100),
              currency: 'cad',
            });

            console.log(`✅ Prix corrigé pour ${product.title}`);
          }
        }
      } else {
        console.log(`❌ Produit non trouvé dans Stripe: ${product.title}`);
        console.log('💡 Vous devez créer ce produit manuellement dans le dashboard Stripe');
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${product.title}:`, error);
    }
  }

  console.log('🏁 Synchronisation terminée');
  console.log('');
  console.log('📝 Résumé :');
  console.log('- ✅ Les commandes seront sauvegardées automatiquement');
  console.log('- ✅ Les adresses clients seront collectées');
  console.log('- ✅ Le stock sera mis à jour si les métadonnées sont présentes');
  console.log('- ⚠️  Si les métadonnées ne sont pas présentes, le stock ne sera pas mis à jour');
}

syncStripeProducts()
  .catch(console.error)
  .finally(() => process.exit(0));
