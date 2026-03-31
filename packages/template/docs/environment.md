# Environment Configuration

This project uses **Vite environment variables** for configuration. All environment variables must be prefixed with `VITE_` to be exposed to the client.

## Files

- **`.env.example`** - Template with all available configuration options (committed to git)
- **`.env.local`** - Local development overrides (ignored by git)
- **`.env.production`** - Production-specific configuration (optional, ignored by git)

## Available Variables

### API Configuration

```bash
# Base URL for API requests (only used when VITE_USE_HTTP=true)
VITE_API_BASE_URL=http://localhost:3000/api
```

### Repository Mode

```bash
# Set to 'true' to use HTTP repository instead of in-memory demo
# When false or omitted, uses in-memory repository with demo data
VITE_USE_HTTP=false
```

## Usage in Code

Environment variables are validated using Zod schemas in [src/app/bootstrap/env.ts](../src/app/bootstrap/env.ts):

```typescript
import { getEnv } from '@/app/bootstrap/env'

const env = getEnv()
console.log(env.VITE_API_BASE_URL)
```

## Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update values in `.env.local` for your local environment

3. **Never commit `.env.local` or `.env.production`** - they're ignored by git

## Notes

- Vite **requires a dev server restart** when changing `.env` files
- Only variables prefixed with `VITE_` are exposed to the client
- All variables are validated at startup using Zod schemas
- Invalid configurations will throw runtime errors with descriptive messages
