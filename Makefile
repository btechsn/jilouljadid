.PHONY: help up down build logs migrate seed deploy-check

help: ## Aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Démarre la stack production
	docker compose up -d --build

down: ## Arrête la stack
	docker compose down

build: ## Rebuild les images
	docker compose build --no-cache

logs: ## Logs (SERVICE=nginx|app|next)
	@if [ -z "$(SERVICE)" ]; then docker compose logs -f --tail=100; else docker compose logs -f --tail=100 $(SERVICE); fi

migrate: ## Migrations
	docker compose exec app php artisan migrate --force

seed: ## Seeders
	docker compose exec app php artisan db:seed --force

key: ## Affiche une APP_KEY
	docker compose run --rm app php artisan key:generate --show

deploy-check: ## Vérifie .env minimal
	@test -f .env || (echo "Manque .env — cp .env.example .env" && exit 1)
	@grep -q "CHANGE_ME" .env && echo "ATTENTION: secrets CHANGE_ME encore présents dans .env" || echo ".env OK"
