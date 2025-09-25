# Configuration de la Base de Données Vercel Postgres

## Variables d'environnement à créer

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Database - Vercel Postgres
POSTGRES_URL=your_postgres_url_here
POSTGRES_PRISMA_URL=your_postgres_prisma_url_here
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling_here

# Stripe (existant)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App (existant)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configuration sur Vercel

1. **Aller sur Vercel Dashboard**
2. **Sélectionner votre projet**
3. **Aller dans Settings > Environment Variables**
4. **Ajouter les variables** avec les valeurs de production

## Installation des dépendances

```bash
npm install @vercel/postgres
```

## Initialisation de la base de données

```bash
# En local (après avoir configuré les variables d'environnement)
npx tsx scripts/init-db.ts

# Ou dans Vercel (se fera automatiquement au déploiement)
```

## Structure de la base de données

- **orders** : Persistance des commandes Stripe
- **product_stock** : Statut des produits (inStock)

Les autres données (description, prix, etc.) restent dans `products.ts`
