# 🧪 Tests Automatisés - Guide de Configuration

## 🚀 Vue d'ensemble

Les tests automatisés vérifient que :
- ✅ Les adresses clients ne sont pas dupliquées
- ✅ L'email du client est sauvegardé
- ✅ La base de données fonctionne
- ✅ Stripe est connecté (si clé disponible)
- ✅ Le processus de build fonctionne

## 🛠️ Configuration Locale

### 1. Variables d'environnement
```bash
# Dans votre fichier .env
STRIPE_SECRET_KEY=sk_live_votre_clé_stripe
```

### 2. Exécuter les tests
```bash
# Tests automatisés (fonctionne sans clé Stripe)
npm run test

# Tests complets (nécessite clé Stripe)
npm run test:full

# Développement avec tests
npm run dev:test

# Build avec tests
npm run build:test
```

## ☁️ Configuration Vercel

### Variables d'environnement (Dashboard Vercel)
1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez :
   ```
   STRIPE_SECRET_KEY = sk_live_...
   ```

### Scripts de Build (vercel.json)
```json
{
  "buildCommand": "npm run build:test",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Tests Automatiques sur Vercel
Les tests roulent automatiquement lors du déploiement si vous configurez :

1. **Build Command** : `npm run build:test`
2. **Environment Variables** : Ajoutez votre clé Stripe

## 📋 Types de Tests

### 🔄 Tests Automatisés (`test-automated.js`)
- ✅ Connexion base de données
- ✅ Connexion Stripe (si clé disponible)
- ✅ Fonctionnalité de déduplication d'adresses
- ✅ Création de commandes
- ⚠️ **Fonctionne sans clé Stripe**

### 🧪 Tests Complets (`test-final-fixes.js`)
- ✅ Tous les tests automatisés
- ✅ Test avec session Stripe réelle
- ✅ Vérification des adresses sauvegardées
- ❌ **Nécessite clé Stripe**

### 🚀 Tests de Déploiement (`test-deployment.sh`)
- ✅ Variables d'environnement
- ✅ Connexion base de données
- ✅ Processus de build
- ✅ Tests automatisés
- ✅ Points d'API (développement seulement)

## 🔧 Commandes Disponibles

```bash
# Développement
npm run dev              # Démarrage normal
npm run dev:test         # Démarrage avec tests

# Build
npm run build            # Build normal
npm run build:test       # Build avec tests

# Tests
npm run test             # Tests automatisés
npm run test:full        # Tests complets

# Déploiement
./test-deployment.sh     # Tests de déploiement
```

## 🎯 Résultats Attendus

### Tests Réussis
```
🚀 Running automated tests...
📋 Test 1: Database connection... ✅
📋 Test 2: Stripe connection... ✅
📋 Test 3: Address saving functionality... ✅
📋 Test 4: Order creation... ✅
🎉 All automated tests passed!
```

### Tests Échoués
```
❌ Automated test failed: [raison]
```

## 🐛 Dépannage

### Problème : "Stripe API key not found"
**Solution :**
- Ajoutez `STRIPE_SECRET_KEY=sk_live_...` dans votre fichier `.env`
- Ou configurez la variable d'environnement sur Vercel

### Problème : "Database connection failed"
**Solution :**
- Vérifiez votre connexion Prisma
- Assurez-vous que DATABASE_URL est configurée

### Problème : Tests ne roulent pas sur Vercel
**Solution :**
1. Vérifiez les variables d'environnement sur Vercel
2. Configurez `buildCommand` dans vercel.json
3. Vérifiez les logs de déploiement Vercel

## 📊 Surveillance

Les tests créent des logs détaillés pour :
- Débogage des problèmes
- Surveillance du déploiement
- Validation des corrections

**Les tests sont maintenant configurés pour rouler automatiquement !** 🎉
