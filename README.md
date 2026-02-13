# JOBSY Backend

JOBSY est une plateforme de recrutement en ligne qui met en relation les talents et les recruteurs. Ce dépôt contient l’API backend construite avec NestJS, Prisma et PostgreSQL.

## Fonctionnalités principales
- Authentification JWT + refresh tokens stockés en base
- Gestion des rôles (CANDIDAT, RECRUTEUR, ADMIN)
- Profils candidat et recruteur
- Gestion des entreprises et des pays
- Téléphones multiples avec gestion du principal
- Uploads (photo, CV, logo) + accès statique via `/uploads`
- Documentation Swagger disponible sur `/docs`

## Architecture
Le projet suit une architecture en couches :
- `domain/` : règles métier pures
- `application/` : cas d’usage (orchestration)
- `infrastructure/` : accès Prisma, I/O, fichiers, etc.

## Prérequis
- Node.js 18+ recommandé
- PostgreSQL

## Installation
```bash
npm install
```

## Configuration
Crée un fichier `.env` à la racine avec au minimum :
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/jobsy"
JWT_ACCESS_SECRET="change_me"
JWT_REFRESH_SECRET="change_me"
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=30
PORT=3000
NODE_ENV=development
```

## Base de données
```bash
npx prisma generate
npx prisma migrate dev
```

## Lancer le projet
```bash
# développement
npm run start:dev

# production
npm run build
npm run start:prod
```

## Tests
```bash
npm run test
npm run test:e2e
```

## Notes
- L’origine CORS est configurée dans `src/main.ts` (par défaut `http://localhost:5173`).
- Les fichiers uploadés sont stockés dans `./uploads`.

## Documentation API
Une fois l’application lancée :
- Swagger: `http://localhost:3000/docs`

---
Si tu veux, je peux ajouter une section détaillée des endpoints ou un guide d’onboarding pour l’équipe.
