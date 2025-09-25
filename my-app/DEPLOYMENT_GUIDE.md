# Guide de Déploiement - Vercel Postgres

## 1. Configuration de Vercel Postgres

### Dans le Dashboard Vercel :

1. **Aller dans Storage**
2. **Cliquer sur "Create Database"**
3. **Sélectionner "Postgres"**
4. **Choisir une région proche** (ex: Washington D.C. pour l'Amérique du Nord)
5. **Nommer la base** (ex: `benito-pepito-db`)
6. **Cliquer sur "Create"**

### Récupérer les URLs :
- **POSTGRES_URL** : URL complète avec pooling
- **POSTGRES_URL_NON_POOLING** : URL sans pooling (pour les transactions)
- **POSTGRES_PRISMA_URL** : URL pour Prisma (si utilisé plus tard)

## 2. Variables d'Environnement

### Dans Vercel Dashboard > Settings > Environment Variables :

```env
# Database
POSTGRES_URL=postgresql://user:pass@host:5432/db?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://user:pass@host:5432/db?sslmode=require
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 3. Déploiement

### Premier Déploiement :

1. **Push les changements** vers votre repo Git
2. **Vercel va automatiquement** :
   - Détecter les nouvelles variables d'environnement
   - Installer `@vercel/postgres`
   - Builder et déployer l'app

3. **L'initialisation se fera automatiquement** via l'API `/api/init-db`

### Déploiements Suivants :
- Les migrations se font automatiquement
- Le stock est préservé entre les déploiements

## 4. Vérification

### Après le Déploiement :

1. **Vérifier les logs** dans Vercel Dashboard
2. **Tester l'API** `/api/products` pour voir le stock
3. **Faire un achat test** pour vérifier la persistance

### Monitoring :
- **Vercel Analytics** : Performance et erreurs
- **Vercel Logs** : Logs de l'application
- **Database Dashboard** : Métriques PostgreSQL

## 5. Développement Local

### Avec la Base de Données de Production :

1. **Ajouter dans `.env.local`** :
```env
POSTGRES_URL=votre_url_de_production
POSTGRES_URL_NON_POOLING=votre_url_sans_pooling
POSTGRES_PRISMA_URL=votre_url_prise
```

2. **Exécuter l'initialisation** :
```bash
npm run db:init
```

3. **Démarrer en mode dev** :
```bash
npm run dev
```

## 6. Sécurité

- ✅ **SSL automatique** sur Vercel Postgres
- ✅ **Variables d'environnement** chiffrées
- ✅ **Réseau privé** entre Vercel et la DB
- ✅ **Backup automatique** par Vercel

## 7. Coûts

- **Vercel Postgres** : Gratuit jusqu'à 512MB
- **Au-delà** : ~$0.10/GB/mois
- **Pas de frais de sortie** de données

---

🎉 **Votre app est maintenant production-ready avec persistance des données !**
