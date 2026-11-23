#!/bin/sh
# Une fois sur le VPS, après copie du projet dans /var/www/jilouljadid
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ .env créé — édite les CHANGE_ME_* puis relance ce script"
  exit 1
fi

if grep -q 'CHANGE_ME' .env; then
  echo "⚠️  Des secrets CHANGE_ME_* restent dans .env — change-les avant de continuer."
  exit 1
fi

if ! grep -q '^APP_KEY=base64:' .env; then
  echo "→ Build image PHP + génération APP_KEY..."
  docker compose build app
  KEY=$(docker compose run --rm --no-deps --entrypoint php app -r "echo 'base64:' . base64_encode(random_bytes(32));")
  sed -i "s|^APP_KEY=.*|APP_KEY=$KEY|" .env
  echo "→ APP_KEY écrit"
fi

echo "→ Démarrage stack..."
docker compose up -d --build

echo "→ Migrations + seed..."
# attendre que l'entrypoint ait installé vendor
i=0
until docker compose exec -T app test -f vendor/autoload.php; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "Timeout: vendor non installé"
    docker compose logs app --tail=50
    exit 1
  fi
  sleep 5
done

docker compose exec -T app php artisan migrate --force
docker compose exec -T app php artisan db:seed --force
docker compose exec -T app php artisan storage:link || true

echo ""
echo "Site  : https://jilouljadid.com"
echo "Admin : https://jilouljadid.com/institut/administration"
echo "Login : admin@nujumalhuda.com / password"
echo "DNS   : A @ et www → 185.98.139.60 (VPS LWS)"
