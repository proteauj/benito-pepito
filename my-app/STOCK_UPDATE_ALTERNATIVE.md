# Solution alternative - Mise à jour manuelle du stock

## Problème résolu : Récupération des IDs depuis Stripe

Puisque la récupération des métadonnées depuis Stripe ne fonctionne pas, j'ai créé une **solution alternative** qui passe les IDs des produits directement dans l'URL de succès.

## ✅ Comment ça fonctionne maintenant

### 1. Processus de paiement modifié :

**Avant (avec Stripe metadata) :**
```
Checkout → Stripe → Webhook → Récupération metadata → Update stock
```

**Maintenant (avec URL parameters) :**
```
Checkout → URL avec product IDs → Page succès → Update stock direct
```

### 2. Flux de données :

```javascript
// Dans create-checkout-session
const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&products=${encodeURIComponent(JSON.stringify(items.map(it => it.id)))}`;

// Dans success page
const productsParam = searchParams.get('products');
const productIds = JSON.parse(decodeURIComponent(productsParam));
await updateStock(productIds);
```

## 🛠️ Outils créés

### 1. Mise à jour automatique (recommandé)
- **URL** : `/success?session_id=...&products=["pa5","sc1"]`
- ✅ **Automatique** après paiement réussi
- ✅ **IDs passés dans l'URL** de succès
- ✅ **Mise à jour directe** du stock

### 2. Mise à jour manuelle (backup)
- **URL** : `/update-stock`
- ✅ **Interface visuelle** pour mise à jour manuelle
- ✅ **Pour les cas** où l'automatique ne fonctionne pas
- ✅ **Test de l'API** de mise à jour

### 3. Diagnostics
- **URL** : `/check-config` - Vérifier configuration Stripe
- **URL** : `/debug-payment` - Diagnostiquer problèmes Stripe

## 🚀 Comment utiliser

### Pour votre achat de "Cement on cardboard" (pa5) :

#### Option 1 : Automatique (après paiement)
1. Le système passe automatiquement `products=["pa5"]` dans l'URL
2. La page de succès met à jour le stock automatiquement
3. Vérifiez que `inStock: false` dans `products.ts`

#### Option 2 : Manuel (maintenant)
1. **Allez sur** : `http://localhost:3000/update-stock`
2. **Entrez** : `pa5`
3. **Cliquez** : "Marquer comme VENDU"
4. **Vérifiez** : Le produit affiche maintenant "Vendu"

## 🔧 Avantages de cette solution

### ✅ **Fiabilité** :
- Plus de dépendance aux métadonnées Stripe
- Mise à jour directe et immédiate
- Pas d'intermédiaire complexe

### ✅ **Simplicité** :
- Code plus simple et maintenable
- Moins d'appels API
- Plus facile à déboguer

### ✅ **Flexibilité** :
- Fonctionne même si Stripe a des problèmes
- Peut être utilisé manuellement si nécessaire
- Facile à étendre

## 📋 Résumé des changements

### Fichiers modifiés :
- ✅ `create-checkout-session/route.ts` - Ajoute products dans l'URL
- ✅ `success/page.tsx` - Lit products depuis l'URL et met à jour
- ✅ `update-stock/route.ts` - API pour mise à jour manuelle
- ✅ `update-stock/page.tsx` - Interface de mise à jour manuelle

### Nouvelles fonctionnalités :
- ✅ Mise à jour automatique via URL parameters
- ✅ Mise à jour manuelle avec interface
- ✅ Diagnostics complets
- ✅ Logs détaillés

## 🎯 Prochaines étapes

1. **Testez** : `http://localhost:3000/update-stock` avec `pa5`
2. **Vérifiez** : Le produit se met à jour dans `products.ts`
3. **Observez** : "Vendu" au lieu de "Ajouter au panier"
4. **Utilisez** : L'automatique lors du prochain paiement

Cette solution est **plus fiable** et **plus simple** que l'approche Stripe metadata ! 🎨✨
