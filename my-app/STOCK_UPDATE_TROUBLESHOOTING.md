# Guide de dépannage - Stock non mis à jour

## Problème : "Cement on cardboard" (pa5) reste `inStock: true` après achat

### Étape 1: Test de l'API de mise à jour manuelle

**Testez d'abord la mise à jour manuelle :**
1. Allez sur : `http://localhost:3000/test-stock`
2. Cliquez sur "Mark as SOLD"
3. Vérifiez si le produit se met à jour dans `products.ts`

Si cela ne fonctionne pas :
- ❌ L'API de mise à jour ne fonctionne pas
- Vérifiez les logs du serveur pour les erreurs

### Étape 2: Vérifier la configuration Stripe

**Vérifiez que les métadonnées sont correctement configurées :**

1. **Dans votre code checkout :**
   ```typescript
   product_data: {
     name: it.name,
     metadata: {
       productId: it.id // ← Doit être présent
     }
   }
   ```

2. **Testez l'API de produits :**
   - GET `/api/products?test=update-stock` - voir les instructions
   - PUT `/api/products` avec `{"productIds": ["pa5"], "inStock": false}`

### Étape 3: Vérifier les logs du webhook

**Dans les logs de votre serveur, cherchez :**
- `Processing line item: { priceId: "...", quantity: 1 }`
- `Retrieved price: { priceId: "...", productId: "prod_..." }`
- `Retrieved product: { productId: "prod_...", metadata: { productId: "pa5" } }`
- `Added product ID to update list: pa5`

Si vous ne voyez pas ces logs :
- ❌ Le webhook n'est pas appelé
- ❌ Les métadonnées ne sont pas récupérées

### Étape 4: Vérifier la configuration du webhook Stripe

**Dans Stripe Dashboard :**
1. Developers → Webhooks
2. Vérifiez que l'endpoint est : `https://votre-domaine.vercel.app/api/webhooks/stripe`
3. Événements activés : `checkout.session.completed`
4. Testez le webhook avec "Send test event"

### Étape 5: Vérifier les variables d'environnement

**Variables requises :**
```bash
STRIPE_SECRET_KEY=sk_test_...      # ← Clé de test Stripe
STRIPE_WEBHOOK_SECRET=whsec_...   # ← Secret du webhook
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ← URL de l'app
```

### Étape 6: Test avec Stripe CLI (local)

```bash
# Terminal 1 - Démarrer l'app
npm run dev

# Terminal 2 - Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3 - Déclencher un événement de test
stripe trigger checkout.session.completed
```

### Étape 7: Debug des métadonnées

**Vérifiez que les métadonnées sont créées correctement :**

1. Créez une session de paiement
2. Dans Stripe Dashboard → Payments → Session
3. Vérifiez les métadonnées du produit :
   ```json
   {
     "product_data": {
       "metadata": {
         "productId": "pa5"
       }
     }
   }
   ```

### Étape 8: Vérifier la logique du webhook

**Le webhook doit :**
1. ✅ Recevoir l'événement `checkout.session.completed`
2. ✅ Extraire les `line_items` de la session
3. ✅ Récupérer le `price.id` de chaque item
4. ✅ Récupérer le produit depuis `price.product`
5. ✅ Extraire `product.metadata.productId`
6. ✅ Appeler l'API de mise à jour avec les IDs

### Étape 9: Test de l'API de vérification

**Testez l'endpoint de vérification :**
```bash
curl -X GET "http://localhost:3000/api/verify-payment?session_id=cs_test_..."
```

### Étape 10: Vérifier la page de succès

**La page de succès doit :**
1. ✅ Recevoir le `session_id` comme paramètre
2. ✅ Appeler `/api/verify-payment` avec le session_id
3. ✅ Déclencher la mise à jour du stock si le paiement est réussi

## Solutions rapides

### Solution 1: Mise à jour manuelle (temporaire)
```bash
curl -X POST http://localhost:3000/api/test-stock \
  -H "Content-Type: application/json" \
  -d '{"productId": "pa5", "inStock": false}'
```

### Solution 2: Redémarrer le système
1. Redémarrez votre serveur de développement
2. Vérifiez que les variables d'environnement sont chargées
3. Testez avec un nouveau paiement

### Solution 3: Vérifier les permissions
- Assurez-vous que l'API peut écrire dans le fichier products.ts
- Vérifiez les permissions du serveur

## Contact support

Si le problème persiste :
1. Partagez les logs du webhook
2. Partagez les logs de l'API `/api/products`
3. Partagez la configuration de votre webhook Stripe
