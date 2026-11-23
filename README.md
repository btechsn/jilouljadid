# Jiloul Jadid — La Nouvelle Génération

Site + API + admin du mouvement **Jiloul Jadid** (Dakar).

## Stack

| Couche | Techno |
|--------|--------|
| Frontend | Next.js 16 + next-intl (FR / EN / AR) |
| Backend | Laravel + Filament |
| Proxy | Nginx |
| DB / Cache | PostgreSQL 16 + Redis 7 |
| Temps réel | Laravel Reverb |

## Déploiement

Domaine : **https://jilouljadid.com** (VPS LWS `185.98.139.60`)  
Voir **[DEPLOY-VPS.md](./DEPLOY-VPS.md)**

```bash
cp .env.example .env
# éditer les secrets
docker compose up -d --build
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
```

## Développement local (Laragon)

```bash
# Backend
cd backend && php artisan serve

# Frontend
cd frontend && npm run dev
```

Ou Docker local :

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

## Accès admin (après seed)

- URL : `/institut/administration`
- Email : `admin@nujumalhuda.com`
- Mot de passe : `password`
