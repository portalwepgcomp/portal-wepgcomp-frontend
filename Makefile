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

export NEXT_PUBLIC_API_URL ?= http://localhost:3001

ci:
	npm run ci
