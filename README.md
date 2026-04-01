# NeoGochi

A real-time virtual pet (Tamagotchi-style) that lives in your browser. Each pet is procedurally generated from a unique seed — no two pets look or behave exactly the same.

Built with NestJS, Next.js, Redis, and PostgreSQL.

![Status](https://img.shields.io/badge/status-in%20development-yellow)

## What is this?

NeoGochi is a digital pet you raise in real time. Your pet gets hungry, tired, dirty, and bored on its own — you need to check in and take care of it. If you neglect it for too long, it dies and gets added to the graveyard.

There's no login or account system. Each browser session gets one pet. When you open the app, you pick a name and a personality class, and your pet hatches with a unique appearance based on its UUID.

### Features

- **Unique pets** — Every pet gets a procedurally generated look (body shape, colors, eyes, ears, accessories) derived from a UUID seed. You can't get the same pet twice.
- **Real-time stats** — Hunger, happiness, energy, health, and cleanliness decay over time via server-side ticks (every 30 seconds). Stats update live through WebSockets.
- **Actions** — Feed, play, sleep, clean, and heal your pet. Each action has cooldowns and visual animations.
- **State machine** — Pets transition between states (idle, eating, playing, sleeping, sick, evolving, dead) with different behaviors and visual indicators.
- **Evolution** — Pets gain XP from interactions and evolve at level thresholds.
- **Graveyard** — Dead pets are persisted to PostgreSQL. You can browse the graveyard to see your past pets.
- **Visual feedback** — Low stats trigger visual indicators (drool when hungry, droopy eyes when tired, stink lines when dirty, tears when sad).

### Personality classes

When you hatch a pet, you pick one of three starting classes that affect stat decay rates:

- **Aggressive** — Gets hungry faster, but gains more XP from playing
- **Chill** — Balanced decay, slower to get sick
- **Intellectual** — Energy decays faster, but happiness is more stable

## Tech stack

| Layer       | Tech                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Frontend    | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Zustand |
| Backend     | NestJS 10, CQRS (`@nestjs/cqrs`), Socket.io                             |
| Database    | PostgreSQL 16 (via Drizzle ORM) — graveyard persistence                 |
| Cache/State | Redis 7 — live pet state storage                                        |
| Job queue   | BullMQ — tick scheduling (stat decay every 30s)                         |
| Shared      | Zod schemas, TypeScript types, pet DNA generator                        |
| Testing     | Vitest (unit/integration), Playwright (E2E)                             |

## Architecture

The backend follows hexagonal architecture (ports & adapters):

```
apps/backend/src/
├── domain/           # Pet entity, state machine, value objects
├── application/      # Commands, queries, handlers, ports (interfaces)
├── infrastructure/   # Redis adapter, Drizzle/Postgres adapter, BullMQ, WebSocket gateway
├── web/              # REST controllers, exception filter
└── config/           # NestJS config module
```

The frontend is a standard Next.js App Router setup with three pages:

- **Hatchery** (`/`) — Pick a name and class, hatch your pet
- **Living Room** (`/pet`) — Main dashboard with stats, actions, and your pet
- **Graveyard** (`/graveyard`) — Browse past pets

Communication between frontend and backend is primarily through WebSockets (Socket.io), with a REST endpoint for the graveyard.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- [Docker](https://www.docker.com/) (for Redis and PostgreSQL)

### Setup

```bash
# Clone the repo
git clone <your-repo-url> neogochi
cd neogochi

# Install dependencies
pnpm install

# Copy environment config
cp .env.example .env
```

### Run the app

```bash
pnpm dev
```

That's it. This single command will:

1. Start Redis and PostgreSQL containers (via Docker Compose)
2. Build the shared package
3. Start the backend (NestJS on port 3001) and frontend (Next.js on port 3000) concurrently

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run individually

If you prefer to manage services separately:

```bash
# Start just the databases
pnpm services:up

# Build shared types
pnpm --filter shared build

# Start backend only
pnpm dev:backend

# Start frontend only (in another terminal)
pnpm dev:frontend

# Stop databases
pnpm services:down
```

### Run tests

```bash
# All tests
pnpm test

# Backend only
pnpm test:backend

# Frontend only
pnpm test:frontend

# E2E (requires app running)
pnpm test:e2e
```

## Project structure

```
neogochi/
├── apps/
│   ├── backend/        # NestJS API + WebSocket server
│   └── frontend/       # Next.js web app
├── packages/
│   └── shared/         # Zod schemas, types, pet DNA generator
├── e2e/                # Playwright E2E tests
├── docker-compose.yml  # Redis + PostgreSQL
└── package.json        # Monorepo root scripts
```

## Environment variables

See `.env.example` for all available config. The defaults work out of the box with the Docker Compose setup.

| Variable             | Default                                                | Description                  |
| -------------------- | ------------------------------------------------------ | ---------------------------- |
| `PORT`               | `3001`                                                 | Backend server port          |
| `REDIS_HOST`         | `localhost`                                            | Redis host                   |
| `REDIS_PORT`         | `6379`                                                 | Redis port                   |
| `DATABASE_URL`       | `postgres://neogochi:neogochi@localhost:5432/neogochi` | PostgreSQL connection string |
| `TICK_INTERVAL_MS`   | `30000`                                                | How often stats decay (ms)   |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:3001`                                | WebSocket URL for frontend   |

## License

MIT
