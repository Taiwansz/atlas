# =============================================================================
# Atlas Engineering OS — Makefile
# =============================================================================
# Quick reference for common development commands
# Usage: make <target>
# =============================================================================

.PHONY: help setup dev build test lint clean docker-up docker-down

# Default target
.DEFAULT_GOAL := help

# Colors
CYAN  := \033[36m
WHITE := \033[37m
RESET := \033[0m

## help: Show this help message
help:
	@echo ""
	@echo "$(CYAN)Atlas Engineering OS — Development Commands$(RESET)"
	@echo "============================================"
	@grep -E '^## ' Makefile | sed 's/## //' | awk 'BEGIN {FS = ": "}; {printf "$(CYAN)%-20s$(WHITE)%s$(RESET)\n", $$1, $$2}'
	@echo ""

## setup: Initial project setup (install deps, setup env)
setup:
	@echo "$(CYAN)Setting up Atlas development environment...$(RESET)"
	@cp -n .env.template .env.local || true
	@pnpm install
	@echo "$(CYAN)✓ Dependencies installed$(RESET)"
	@echo "$(CYAN)⚠ Edit .env.local with your configuration$(RESET)"

## dev: Start all development services
dev: docker-up
	@echo "$(CYAN)Starting Atlas development servers...$(RESET)"
	@pnpm dev

## build: Build all packages
build:
	@echo "$(CYAN)Building all Atlas packages...$(RESET)"
	@pnpm build

## build-affected: Build only affected packages
build-affected:
	@pnpm build:affected

## test: Run all tests
test:
	@echo "$(CYAN)Running all tests...$(RESET)"
	@pnpm test

## test-affected: Run tests for affected packages only
test-affected:
	@pnpm test:affected

## test-coverage: Run tests with coverage report
test-coverage:
	@pnpm test:coverage

## lint: Lint all packages
lint:
	@pnpm lint

## lint-affected: Lint only affected packages
lint-affected:
	@pnpm lint:affected

## typecheck: TypeScript type checking
typecheck:
	@pnpm typecheck

## format: Format all code
format:
	@pnpm format

## format-check: Check code formatting
format-check:
	@pnpm format:check

## clean: Clean all build artifacts
clean:
	@echo "$(CYAN)Cleaning build artifacts...$(RESET)"
	@pnpm clean
	@rm -rf .nx/cache

## docker-up: Start all Docker development services
docker-up:
	@echo "$(CYAN)Starting Docker services...$(RESET)"
	@docker compose up -d
	@echo "$(CYAN)✓ Services started$(RESET)"
	@echo "$(WHITE)  PostgreSQL:  localhost:5432$(RESET)"
	@echo "$(WHITE)  Neo4j:       localhost:7474$(RESET)"
	@echo "$(WHITE)  Redis:       localhost:6379$(RESET)"
	@echo "$(WHITE)  Qdrant:      localhost:6333$(RESET)"
	@echo "$(WHITE)  Kafka:       localhost:9092$(RESET)"
	@echo "$(WHITE)  Jaeger:      localhost:16686$(RESET)"
	@echo "$(WHITE)  Grafana:     localhost:3100$(RESET)"
	@echo "$(WHITE)  Keycloak:    localhost:8080$(RESET)"
	@echo "$(WHITE)  Vault:       localhost:8200$(RESET)"
	@echo "$(WHITE)  MinIO:       localhost:9001$(RESET)"

## docker-down: Stop all Docker services
docker-down:
	@echo "$(CYAN)Stopping Docker services...$(RESET)"
	@docker compose down

## docker-reset: Reset Docker services (DESTRUCTIVE - removes all data)
docker-reset:
	@echo "$(CYAN)⚠ WARNING: This will delete all local data!$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker compose down -v
	@echo "$(CYAN)✓ All Docker volumes removed$(RESET)"

## graph: Show dependency graph
graph:
	@pnpm graph

## new-engine: Scaffold a new Atlas engine (usage: make new-engine NAME=myengine)
new-engine:
	@echo "$(CYAN)Creating new engine: $(NAME)$(RESET)"
	@pnpm exec nx generate @nx/js:library --name=$(NAME) --directory=engines/$(NAME) --tags="scope:engine,type:util"

## new-agent: Scaffold a new Atlas agent (usage: make new-agent NAME=myagent)
new-agent:
	@echo "$(CYAN)Creating new agent: $(NAME)$(RESET)"
	@pnpm exec nx generate @nx/js:library --name=$(NAME) --directory=packages/agents/$(NAME) --tags="scope:package,type:util"

## check-all: Run all quality checks (use before committing)
check-all: format-check lint typecheck test

## atlas-init: Initialize Atlas for a new project
atlas-init:
	@pnpm exec atlas init

## release: Create a new release
release:
	@pnpm release

## docs: Start documentation server
docs:
	@echo "$(CYAN)Documentation is in /docs directory$(RESET)"
	@echo "$(WHITE)Open docs/index.md to start$(RESET)"
