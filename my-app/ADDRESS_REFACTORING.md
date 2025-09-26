# 🔄 Refactorisation - Centraliser la sauvegarde d'adresses

## 🎯 **Problème actuel :**
- 4 endroits différents sauvegardent les adresses
- Code dupliqué dans chaque API
- Risque de duplication si plusieurs APIs sont appelées
- Maintenance difficile

## ✅ **Solution : Service centralisé**

### 📁 **1. Créer le service centralisé**
```typescript
// lib/services/address-service.ts
export class AddressService {
  static async saveAddressesForSession(
    sessionId: string,
    billingAddress?: Stripe.Address,
    shippingAddress?: Stripe.Address,
    customerEmail?: string
  ): Promise<void>
}
```

### 🔄 **2. Refactoriser les APIs**

#### **Avant (code dupliqué) :**
```typescript
// Dans chaque API...
async function saveCustomerAddress(orderId, billing, shipping) {
  // 40+ lignes de code identique
  if (billingAddress) { /* logique */ }
  if (shippingAddress) { /* logique */ }
}
```

#### **Après (service centralisé) :**
```typescript
// Dans chaque API...
import { AddressService } from '../../../lib/services/address-service';

await AddressService.saveAddressesForSession(
  sessionId,
  billingAddress,
  shippingAddress,
  customerEmail
);
```

### 📋 **3. APIs à refactoriser :**

| API | Status | Action |
|-----|--------|---------|
| `/api/webhooks/stripe` | 🔄 **À refactoriser** | Remplacer `saveCustomerAddress` |
| `/api/verify-payment` | 🔄 **À refactoriser** | Remplacer `saveCustomerAddress` |
| `/api/update-order-with-cart` | 🔄 **À refactoriser** | Remplacer `saveCustomerAddress` |
| `/api/orders` | 🔄 **À refactoriser** | Remplacer `saveOrderAddress` |

### 🎯 **4. Avantages du service centralisé :**

- ✅ **Single source of truth** - Une seule logique pour tout
- ✅ **Deduplication automatique** - Par session + par adresse
- ✅ **Maintenance facile** - Une seule fonction à modifier
- ✅ **Tests centralisés** - Un seul endroit à tester
- ✅ **Pas de duplication** - Même si plusieurs APIs sont appelées

### 🚀 **5. Plan de migration :**

**Phase 1 : Créer le service** ✅
- Service centralisé créé
- Méthodes de déduplication intégrées

**Phase 2 : Refactoriser les APIs** ⏳
- Remplacer le code dupliqué dans chaque API
- Utiliser le service centralisé

**Phase 3 : Tests** ⏳
- Vérifier que la déduplication fonctionne
- S'assurer qu'aucune régression

### 💡 **6. Exemple d'usage :**

```typescript
// Dans webhook Stripe
await AddressService.saveAddressesForSession(
  session.id,
  billingAddress,
  shippingAddress,
  customerEmail
);

// Dans verify-payment
await AddressService.saveAddressesForSession(
  sessionId,
  billingAddress,
  shippingAddress,
  customerEmail
);

// Dans update-order-with-cart
await AddressService.saveAddressesForSession(
  sessionId,
  billingAddress,
  shippingAddress
);
```

### 🎉 **Résultat attendu :**
- ✅ **1 seule méthode** pour sauvegarder les adresses
- ✅ **0 duplication** d'adresses
- ✅ **Maintenance simplifiée**
- ✅ **Tests centralisés**

**Le service centralisé va résoudre le problème de duplication définitivement !** 🚀
