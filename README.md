# Calculator

> **Note:**  
> This project is a prototype developed for my IP7b project as part of my MSE at FHNW.  
> The code is not production-ready and should not be used as such.

Calculator is a modern, full-stack web application that goes beyond basic arithmetic. It offers a fast, intuitive calculator interface with advanced features such as AI-powered calculations, user authentication, feature flags, and multiple UI themes. The app is designed for both everyday users and power users who want more from their calculator, including analytics and customization.

## Features

- **Standard and advanced calculations**: Perform basic arithmetic as well as more complex operations.
- **AI-powered assistance**: Get help with calculations, explanations, and suggestions using integrated AI.
- **User accounts**: Sign up and sign in to save preferences and access personalized features.
- **Feature flags**: Try out experimental features as they become available.
- **Multiple themes**: Switch between light, dark, and custom themes for the best experience.
- **Analytics**: Track usage and get insights (for users and developers).

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up the database:**
   ```bash
   cd apps/server
   pnpm db:local
   # Update .env if needed
   pnpm db:push
   ```

3. **Start the app:**
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
