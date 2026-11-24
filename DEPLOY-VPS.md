# Déploiement — Jiloul Jadid

| | |
|---|---|
| **Domaine** | https://jilouljadid.com |
| VPS LWS | `vps120813.serveur-vps.net` |
| IP | `185.98.139.60` |

## DNS (LWS)

Pointe le domaine vers le VPS :

| Type | Nom | Valeur |
|------|-----|--------|
| A | `@` | `185.98.139.60` |
| A | `www` | `185.98.139.60` |

## Prérequis VPS

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# déconnexion / reconnexion SSH
```

Ouvre les ports **80** et **443** dans le firewall LWS.

## 1. Envoyer le projet

```bash
rsync -avz --exclude node_modules --exclude .next --exclude vendor \
  --exclude .git --exclude backend/storage/logs \
  ./ root@185.98.139.60:/var/www/jilouljadid/
```

## 2. Secrets

```bash
ssh root@185.98.139.60
cd /var/www/jilouljadid
cp .env.example .env
nano .env   # remplace TOUS les CHANGE_ME_*
```

Les URLs sont déjà en `https://jilouljadid.com`.

## 3. Lancer

```bash
chmod +x scripts/vps-bootstrap.sh
./scripts/vps-bootstrap.sh
```

## 4. HTTPS (Let's Encrypt)

Quand le DNS A pointe bien sur `185.98.139.60` :

```bash
# Certificats sur l'hôte (exemple certbot standalone — arrêter nginx brièvement)
docker compose stop nginx
certbot certonly --standalone -d jilouljadid.com -d www.jilouljadid.com
docker compose start nginx
```

Dans `.env` : `LETSENCRYPT_PATH=/etc/letsencrypt`  
Copie `infra/nginx/conf.d/jilouljadid-ssl.conf.example` → `jilouljadid-ssl.conf` (à adapter), puis :

```bash
docker compose up -d nginx
```

Sans HTTPS tout de suite, le site répond en HTTP sur le port 80 (redirige vers HTTPS une fois SSL actif).

## 5. Accès

| Service | URL |
|---------|-----|
| Site | https://jilouljadid.com |
| Admin | https://jilouljadid.com/jj/administration |
| API | https://jilouljadid.com/api/v1 |

Seed : `admin@jilouljadid.com` / `password` — **à changer tout de suite**.

## Architecture

```
Internet → DNS jilouljadid.com → 185.98.139.60
         → nginx:80/443
              ├─ /api, /jj/administration → Laravel
              ├─ /ws → Reverb
              └─ / → Next.js
         PostgreSQL + Redis (interne Docker)
```
