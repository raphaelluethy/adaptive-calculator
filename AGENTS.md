# Agent Guidelines for Calculator Project

## Build/Lint/Test Commands
- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm check-types` - Type check all packages
- `pnpm dev:web` - Start web app only (port 3001)
- `pnpm dev:server` - Start server only (port 3000)
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open database studio

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