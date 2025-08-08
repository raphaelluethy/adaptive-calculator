# Calculator

> **Note:**  
> This project is a prototype developed for my IP7b project as part of my MSE at FHNW.  
> The code is not production-ready and should not be used as such

POC for adaptive UI interfaces using FeatureFlags, Server Driven UI and a Coding agent based approach.
Also has a chatbox to enable/disable stuff.

## Getting started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Create environment files:**
   ```bash
   cp apps/server/.env.example apps/server/.env
   cp apps/web/.env.example apps/web/.env
   ```
   Update the values as needed (e.g., `VITE_SERVER_URL`, `CORS_ORIGIN`, `DATABASE_URL`).

3. **Set up the database:**
   ```bash
   cd apps/server
   pnpm db:local
   # Update .env if needed
   pnpm db:push
   ```

4. **Start the app:**
   ```bash
   pnpm dev
   ```
   - Web app: [http://localhost:3001](http://localhost:3001)
   - API: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
calculator/
├── apps/
│   ├── web/      # Frontend (React)
│   └── server/   # Backend (API, database)
```

## Essential Commands

- `pnpm dev` — Start all services in development mode
- `pnpm build` — Build all packages
- `pnpm check-types` — Type check all packages
- `pnpm db:push` — Push database schema changes
