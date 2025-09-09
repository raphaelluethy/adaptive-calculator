# Agent Guidelines for Calculator Project

## Lint/Test/Format Commands
- `pnpm format` - Format all packages using Biome
- `pnpm check-types` - Type check all packages
- `turbo -F <package> format` - Format specific package (e.g., `turbo -F web format`)
- `turbo -F <package> check-types` - Type check specific package
- Individual package commands: `turbo -F <package> <command>`
- **NEVER use build or dev commands** unless explicitly instructed (pnpm build, pnpm dev, turbo build, turbo dev)

## Development Commands
- `pnpm dev` - Start web and server in development mode
- `pnpm dev:web` - Start web app only (port 3001)
- `pnpm dev:server` - Start server only (port 3000)
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open database studio
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations

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
- If you add a new theme or feature flag, run the pnpn run db:generate and pnpn run db:migrate command.
