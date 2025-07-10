# Project Overview

This project is a full-stack calculator application with analytics and feature flag support. It is organized as a monorepo with two main packages: a server (backend) and a web (frontend) app.

## Structure

- apps/
  - server/: Node.js backend using TypeScript, Drizzle ORM, and better-auth for authentication. Handles database, API routes (tRPC), and feature flags.
  - web/: React frontend using TypeScript, Tailwind CSS, and tRPC for API calls. Includes UI components, authentication forms, calculator UI, analytics, and feature flag toggles.

## Key Technologies

- TypeScript (strict mode)
- React (frontend)
- tRPC (type-safe API communication)
- Drizzle ORM (database, with LibSQL/Turso)
- better-auth (authentication)
- Tailwind CSS (styling)
- Zod (validation)
- pnpm (monorepo package management)
- TurboRepo (build orchestration)

## Features

- Calculator UI with server-driven and client-driven modes
- User authentication (sign-in, sign-up)
- Feature flag management (toggle features for users)
- Analytics and logging (user actions, mouse position, page views)
- Theming (light/dark mode toggle)
- Modular, reusable UI components

## Development

- Start all services: pnpm dev
- Start only web: pnpm dev:web (port 3001)
- Start only server: pnpm dev:server (port 3000)
- Build all: pnpm build
- Type check: pnpm check-types
- Database: Drizzle ORM with migration and studio commands
- No test framework detected—ask for test commands if needed

## Code Style

- TypeScript strict mode, double quotes, semicolons
- Named exports for components
- External imports first, then internal (@/)
- Prefer const, arrow functions for callbacks
- Tailwind for styling, kebab-case for files, PascalCase for components
- Zod for validation, tRPC for APIs
- Descriptive error handling with try/catch

---

# Agent Guidelines for Calculator Project

## Build/Lint/Test Commands
- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm check-types` - Type check all packages
- `pnpm dev:web` - Start web app only (port 3001)
- `pnpm dev:server` - Start server only (port 3000)
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open database studio
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- Individual package commands: `turbo -F <package> <command>`

## Code Style Guidelines
- Use TypeScript with strict mode enabled
- Import order: external libraries, then internal modules with `@/` prefix
- Use named exports for components (e.g., `export default function Header()`)
- Use double quotes for strings, semicolons required
- Prefer `const` over `let`, use arrow functions for inline callbacks
- Use Tailwind CSS classes for styling
- File naming: kebab-case for files, PascalCase for React components
- Use Zod for validation, tRPC for API calls
- Error handling: throw errors with descriptive messages, use try/catch blocks
- Database: Use Drizzle ORM with LibSQL/Turso
- Authentication: Use better-auth library
- No test framework detected - ask user for test commands if needed
