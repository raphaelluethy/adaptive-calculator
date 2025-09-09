# Gemini Project Context: Calculator

## Project Overview

This is a monorepo project for a calculator application. It consists of a React-based web frontend and a backend API. The project uses `pnpm` for package management and `turbo` for monorepo orchestration. The project is a prototype for an adaptive UI interface using Feature Flags and Server Driven UI.

**Technologies:**

*   **Frontend:** React
*   **Backend:** Node.js (likely, based on the context)
*   **Package Manager:** pnpm
*   **Monorepo Manager:** Turbo

**Architecture:**

The project is structured as a monorepo with two main applications:

*   `apps/web`: The React frontend.
*   `apps/server`: The backend API and database.

## Building and Running

### Prerequisites

*   `pnpm` package manager

### Installation

1.  Install dependencies from the root of the project:
    ```bash
    pnpm install
    ```

### Environment Setup

1.  Create environment files for the server and web apps:
    ```bash
    cp apps/server/.env.example apps/server/.env
    cp apps/web/.env.example apps/web/.env
    ```
2.  Update the values in the `.env` files as needed (e.g., `VITE_SERVER_URL`, `CORS_ORIGIN`, `DATABASE_URL`).

### Database Commands
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open database studio
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations

### Development

*   **Start all services:**
    ```bash
    pnpm dev
    ```
*   **Start only the web app:**
    ```bash
    pnpm dev:web
    ```
*   **Start only the server:**
    ```bash
    pnpm dev:server
    ```

### Building

*   **Build all packages:**
    ```bash
    pnpm build
    ```

### Lint/Test/Format Commands
- `pnpm format` - Format all packages using Biome
- `pnpm check-types` - Type check all packages
- `turbo -F <package> format` - Format specific package (e.g., `turbo -F web format`)
- `turbo -F <package> check-types` - Type check specific package
- Individual package commands: `turbo -F <package> <command>`

## Code Style Guidelines
- Use TypeScript with strict mode enabled, Biome for formatting
- Import order: external libraries, then internal modules with `@/` prefix
- Use named exports for components (e.g., `export default function Header()`)
- File naming: kebab-case for files, PascalCase for React components
- Prefer `const` over `let`, use arrow functions for inline callbacks
- Use Tailwind CSS classes for styling, class-variance-authority for variants
- Use Zod for validation, tRPC for API calls, better-auth for authentication
- Database: Use Drizzle ORM with LibSQL/Turso
- Error handling: throw errors with descriptive messages, use try/catch blocks
- No test framework detected - ask user for test commands if needed

## Development Conventions

*   **Formatting:** The project uses `biome` for formatting. Run `pnpm format` to format the code.
*   **Monorepo Management:** The project uses `turbo` to manage the monorepo. The `turbo.json` file defines the tasks for the monorepo.
*   **ATTENTION:** You are not allowed to run pnpm run dev at any time without explicit permission.
*   **NEVER use build or dev commands** unless explicitly instructed (pnpm build, pnpm dev, turbo build, turbo dev)
*   **DONT USE THE CREATE DB TOOL OR THE DATABASE STUDIO OR THE DATABASE CLI**
