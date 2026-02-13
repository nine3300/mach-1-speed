# Strict ESLint Configuration Setup Guide

This guide explains the strict ESLint configuration that has been implemented in this monorepo to maintain high code quality standards.

## What Has Been Configured

### 1. ESLint Configuration Files

**Main Config:** [packages/eslint-config/index.js](../packages/eslint-config/index.js)

This is the shared ESLint configuration used across all packages and apps in the monorepo. It enforces:

- **No `any` types** - Forces explicit typing or proper type guards
- **No empty blocks** - Requires comments explaining intentional empty blocks
- **Proper type imports** - Separates type and value imports
- **Firebase error safety** - Encourages safe error handling

**App-specific Configs:**

- [apps/web/.eslintrc.cjs](../../apps/web/.eslintrc.cjs) - Web app with additional TypeScript project setup
- [apps/functions/.eslintrc.cjs](../../apps/functions/.eslintrc.cjs) - Cloud Functions app

### 2. Pre-commit Hooks

This project uses **Husky** and **lint-staged** to run linting checks automatically:

```bash
# Configuration in package.json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

When you try to commit TypeScript files, ESLint will automatically run and fix fixable errors. If there are errors that can't be auto-fixed, the commit will fail.

## Quick Start for Developers

### Initial Setup

```bash
# Install dependencies (already done in new monorepos)
pnpm install

# Verify ESLint is set up
pnpm lint
```

### Before Committing

```bash
# Fix all auto-fixable lint issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Run type checking
pnpm typecheck

# Run all pre-checks
pnpm precheck
```

### If Commit Fails

If you try to commit and lint-staged fails:

```bash
# Fix the issues
pnpm lint:fix

# Commit again
git commit -m "your message"
```

## Common Rules & How to Follow Them

### Rule 1: NO 'ANY' TYPES

❌ **Don't do this:**

```typescript
function processData(data: any) {
  return data.value
}
```

✅ **Do this:**

```typescript
interface Data {
  value: string
}

function processData(data: Data) {
  return data.value
}
```

### Rule 2: NO EMPTY BLOCKS

❌ **Don't do this:**

```typescript
try {
  someOperation()
} catch (error) {
  // Oops, forgot to handle!
}
```

✅ **Do this:**

```typescript
try {
  someOperation()
} catch (error) {
  // Intentionally empty - error is logged elsewhere
  console.error('Operation failed', error)
}
```

### Rule 3: FIREBASE ERROR HANDLING

❌ **Don't do this:**

```typescript
try {
  await signIn(email, password)
} catch (error: any) {
  console.log(error.code) // Could be undefined!
}
```

✅ **Do this:**

```typescript
try {
  await signIn(email, password)
} catch (error: unknown) {
  const firebaseError = error as { code?: string; message?: string }
  if (firebaseError?.code === 'auth/user-not-found') {
    // Handle specific error
  }
}
```

### Rule 4: SHADCN UI IMPORTS

❌ **Don't do this:**

```typescript
import { Button } from '@/components/ui/button'
```

✅ **Do this:**

```typescript
import { Button } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

// Use cn() for conditional classes
<Button className={cn('px-4', isActive && 'bg-blue-500')} />
```

## Helpful Commands

```bash
# Run linting
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Run type checking
pnpm typecheck

# Format code with Prettier
pnpm format

# Check formatting without fixing
pnpm format:check

# Run all pre-commit checks
pnpm precheck

# Run tests
pnpm test

# Build all packages
pnpm build
```

## For Visual Studio Code Users

### Recommended Extensions

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Automatically highlights lint errors in your editor

2. **Prettier** (`esbenp.prettier-vscode`)
   - Format code on save

### Recommended Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

This will:

- Auto-fix ESLint errors on save
- Format code with Prettier on save
- Organize imports automatically

## Troubleshooting

### "Unexpected any" Error

**Problem:** ESLint complains about `any` type

**Solution:**

1. Define proper types for your data
2. Use type guards with `unknown`
3. Use generics if appropriate

### "Empty block statement" Error

**Problem:** ESLint complains about empty catch/if blocks

**Solution:** Add a comment explaining why the block is empty:

```typescript
} catch (error) {
  // Intentionally empty - handled at a higher level
}
```

### "Import should be a type import" Error

**Problem:** ESLint says to use `import type`

**Solution:**

```typescript
// Before
import { MyType } from './types'

// After
import type { MyType } from './types'
```

### Pre-commit Hook Not Running

**Problem:** Husky isn't running the lint checks

**Solution:**

```bash
# Reinstall Husky
pnpm exec husky install

# Verify hooks are installed
ls -la .husky/
```

## Best Practices

1. **Write tests first** - Tests help ensure proper typing
2. **Use TypeScript strict mode** - Enable `strict: true` in tsconfig.json
3. **Define interfaces** - Don't rely on inferred types for complex objects
4. **Comment intentional code** - Explain why, not what
5. **Use consistent naming** - Makes code easier to understand
6. **Keep functions small** - Easier to type correctly
7. **Review others' code** - Learn from each other

## Type Definitions for Common Patterns

### React Component with Props

```typescript
import type { ReactNode } from 'react';

interface ComponentProps {
  children: ReactNode;
  className?: string;
}

export function MyComponent({ children, className }: ComponentProps) {
  return <div className={className}>{children}</div>;
}
```

### Error Handler with Firebase

```typescript
import type { AuthError } from 'firebase/auth'

function handleAuthError(error: unknown) {
  const authError = error as AuthError

  const message = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/email-already-in-use': 'Email already in use',
  }[authError?.code]

  return message || 'Unknown error'
}
```

### API Handler with Proper Typing

```typescript
import type { RequestEvent } from '@sveltejs/kit'

export async function POST(event: RequestEvent) {
  try {
    const body = (await event.request.json()) as unknown

    if (typeof body !== 'object' || body === null) {
      return error(400, 'Invalid request body')
    }

    // Process body...
    return json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    return error(500, error.message)
  }
}
```

## Additional Resources

- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [ESLint Rule Documentation](https://eslint.org/docs/rules/)
- [Full Strict Linting Guide](./STRICT_LINTING_GUIDE.md)

## Questions or Issues?

If you have questions about the linting rules:

1. Check [STRICT_LINTING_GUIDE.md](./STRICT_LINTING_GUIDE.md) for detailed examples
2. Run `eslint --debug` on a file to see which rule is failing
3. Check the TypeScript ESLint documentation
4. Ask your team lead or in code review

---

**Last Updated:** February 13, 2026
