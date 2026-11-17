import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Tests and stories live next to the code they cover but are not part of a slice's API.
    ignores: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
  },
])
