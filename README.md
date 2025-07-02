# Calculator

A modern, feature-rich calculator application built with a full-stack TypeScript architecture. This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) and includes advanced features like AI-powered calculations, feature flags, and multiple UI themes.

## Tech Stack

- **Frontend**: React 19, TanStack Router, TailwindCSS v4, shadcn/ui
- **Backend**: Hono, tRPC, Node.js
- **Database**: Drizzle ORM with LibSQL/Turso
- **Authentication**: Better Auth
- **Build System**: Turborepo with pnpm workspaces
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS utility classes
- **AI Integration**: Google AI SDK for enhanced calculator features

## Getting Started

First, install the dependencies:

```bash
pnpm install
```
## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database:
```bash
cd apps/server && pnpm db:local
```


2. Update your `.env` file in the `apps/server` directory with the appropriate connection details if needed.

3. Apply the schema to your database:
```bash
pnpm db:push
```


Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).



## Project Structure

```
calculator/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, TRPC)
```

## Available Scripts

### Development
- `pnpm dev`: Start all applications in development mode
- `pnpm dev:web`: Start only the web application (port 3001)
- `pnpm dev:server`: Start only the server (port 3000)

### Build & Type Checking
- `pnpm build`: Build all applications
- `pnpm check-types`: Check TypeScript types across all apps

### Database Commands
- `pnpm db:push`: Push schema changes to database
- `pnpm db:studio`: Open database studio UI
- `pnpm db:generate`: Generate database migrations
- `pnpm db:migrate`: Run database migrations
- `cd apps/server && pnpm db:local`: Start the local SQLite database

### Individual Package Commands
- `turbo -F <package> <command>`: Run commands for specific packages (e.g., `turbo -F web build`)
