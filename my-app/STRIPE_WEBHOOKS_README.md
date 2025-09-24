# Configuration des Webhooks Stripe pour la gestion automatique du stock

## Configuration des variables d'environnement

### Variables requises pour Vercel/Netlify :

```bash
# Clés Stripe (utilisez les vraies clés, pas les clés de test)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URL de votre application
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

## Configuration des Webhooks Stripe

### 1. Dans votre dashboard Stripe :

1. Allez sur **Developers** → **Webhooks**
2. Cliquez sur **"Add endpoint"**
3. Entrez cette URL :
   ```
   https://votre-domaine.vercel.app/api/webhooks/stripe
   ```
4. Sélectionnez ces événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`

### 2. Récupérer le secret du webhook :

1. Après avoir créé l'endpoint, Stripe vous donnera un secret
2. Ajoutez-le à vos variables d'environnement :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
   ```

## Comment ça fonctionne

### Flux de paiement :

1. **Client** : L'utilisateur ajoute des produits au panier et paie
2. **Stripe** : Traite le paiement et envoie un webhook
3. **Webhook** : Reçoit l'événement `checkout.session.completed`
4. **Récupération IDs** : Extrait les IDs des produits depuis les métadonnées des produits Stripe
5. **Mise à jour** : Marque automatiquement les produits comme vendus (`inStock: false`)
6. **Interface** : Les pages de produits se mettent à jour automatiquement

### Structure des données Stripe :

```json
{
  "line_items": [{
    "price": {
      "id": "price_123",
      "product": "prod_456"
    }
  }],
  "product_data": {
    "metadata": {
      "productId": "sc1" // ← Notre ID de produit
    }
  }
}
```

### Synchronisation automatique :

- Les pages de produits se rafraîchissent toutes les 30 secondes
- Les produits vendus affichent automatiquement "Vendu" au lieu de "Ajouter au panier"
- Le stock est mis à jour en temps réel

## Test en local

### Option 1: Utiliser Stripe CLI

```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Option 2: Utiliser ngrok

```bash
npm install -g ngrok
ngrok http 3000
```

Puis configurez l'URL ngrok dans Stripe comme endpoint de webhook.

## Configuration des tests Stripe

### Mode test :
- Utilisez des clés de test : `sk_test_...`
- Les webhooks fonctionneront de la même façon
- Les paiements sont simulés (aucun frais réel)

### Mode production :
- Utilisez des clés live : `sk_live_...`
- Configurez les vrais webhooks
- Les paiements sont réels

## Sécurité

- ✅ Les webhooks sont vérifiés avec le secret Stripe
- ✅ Seuls les événements signés par Stripe sont traités
- ✅ Les mises à jour de stock sont atomiques
- ✅ Les erreurs sont loggées pour le debugging

## Monitoring

Les logs sont disponibles dans :
- Console Vercel/Netlify pour les erreurs
- Logs Stripe pour les événements de webhook
- Logs de l'API `/api/products` pour les mises à jour de stock
