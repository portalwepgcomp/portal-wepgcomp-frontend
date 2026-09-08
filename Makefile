.PHONY: setup dev build lint test typecheck ci

setup:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

test:
	npm test -- --ci --coverage=false

typecheck:
	npm run typecheck

# Espelha a pipeline de CI (typecheck + lint + test + build).
# Rode antes de abrir/atualizar um PR: `make ci` (ou `npm run ci`).
export NEXT_PUBLIC_API_URL ?= http://localhost:3001

ci:
	npm run ci
