# Strict Linting Guide

This project enforces strict ESLint rules to maintain code quality across the monorepo. All code must pass these rules before being committed.

## ESLint Rules Enforced

### 1. NO 'ANY' TYPES ❌

**Rule:** `@typescript-eslint/no-explicit-any`

**What's NOT allowed:**

```typescript
// ❌ BAD: Using 'any' type
function processData(data: any): void {
  console.log(data)
}

// ❌ BAD: Using 'any' in catch block
try {
  doSomething()
} catch (error: any) {
  console.log(error.message)
}
```

**What IS allowed:**

```typescript
// ✅ GOOD: Using 'unknown' with type guard
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data)
  }
}

// ✅ GOOD: Proper error handling
try {
  doSomething()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message)
  }
}

// ✅ GOOD: Type predicate function
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function processData(data: unknown): void {
  if (isString(data)) {
    console.log(data)
  }
}
```

### 2. NO EMPTY BLOCKS 🚫

**Rules:** `@typescript-eslint/no-empty-function`, `no-empty`

**What's NOT allowed:**

```typescript
// ❌ BAD: Empty catch block without explanation
try {
  fetchData()
} catch (error) {
  // Nothing here - confusing!
}

// ❌ BAD: Empty useEffect without comment
useEffect(() => {}, [dependency])

// ❌ BAD: Empty if block
if (condition) {
}
```

**What IS allowed:**

```typescript
// ✅ GOOD: Comment explaining why it's empty
try {
  fetchData()
} catch (error) {
  // Intentionally empty - error is handled elsewhere
}

// ✅ GOOD: useEffect with proper comment
useEffect(() => {
  // Intentionally empty - just depends on value changes
}, [dependency])

// ✅ GOOD: Meaningful if block
if (condition) {
  handleCondition()
}
```

### 3. FIREBASE ERROR HANDLING 🔐

**Best Practice:** Safe error casting for Firebase

**What's NOT allowed:**

```typescript
// ❌ BAD: Unsafe error access
import { signInWithEmailAndPassword } from 'firebase/auth'

const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    console.log(error.code) // ❌ No type safety!
    alert(error.message) // ❌ Could be undefined!
  }
}
```

**What IS allowed:**

```typescript
// ✅ GOOD: Safe Firebase error handling
import type { AuthError } from 'firebase/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'

const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    const firebaseError = error as AuthError

    if (firebaseError.code === 'auth/user-not-found') {
      alert('User not found')
    } else if (firebaseError.code === 'auth/wrong-password') {
      alert('Wrong password')
    } else {
      alert(firebaseError.message)
    }
  }
}

// ✅ GOOD: Alternative with instanceof check
const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    const authError = error as { code?: string; message?: string }

    if (authError.code === 'auth/invalid-email') {
      alert('Invalid email format')
    } else {
      alert(authError.message || 'Authentication failed')
    }
  }
}
```

### 4. SHADCN UI COMPATIBILITY 🎨

**Rule:** Import UI components from `@repo/ui`

**What's NOT allowed:**

```typescript
// ❌ BAD: Importing from local @/components/ui
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

**What IS allowed:**

```typescript
// ✅ GOOD: Import from @repo/ui
import type { ReactNode } from 'react';
import { Button, Card } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
}

export function MyComponent({ children, variant = 'default' }: CardProps) {
  return (
    <Card className={cn('p-4', variant === 'elevated' && 'shadow-lg')}>
      <Button>{children}</Button>
    </Card>
  );
}

// ✅ GOOD: Using cn() for conditional classes
import { Button } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

interface ButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
}

export function ActionButton({ isDisabled, isLoading }: ButtonProps) {
  return (
    <Button
      disabled={isDisabled || isLoading}
      className={cn(
        isLoading && 'opacity-50 cursor-not-allowed',
        isDisabled && 'pointer-events-none'
      )}
    >
      {isLoading ? 'Loading...' : 'Submit'}
    </Button>
  );
}
```

## Common Error Messages & Fixes

### "Unexpected any. Specify a different type.(eslint@typescript-eslint/no-explicit-any)"

**Fix:** Replace `any` with proper typing:

```typescript
// ❌ Before
function handler(event: any) {}

// ✅ After
import type { ChangeEvent } from 'react'
function handler(event: ChangeEvent<HTMLInputElement>) {}
```

### "Unexpected empty 'if' block.(eslint@no-empty)"

**Fix:** Add a comment explaining the intentional empty block:

```typescript
// ❌ Before
if (shouldRender) {
}

// ✅ After
if (shouldRender) {
  // Intentionally empty - condition checked elsewhere
}
```

### "Empty function.(eslint@typescript-eslint/no-empty-function)"

**Fix:** Add a comment:

```typescript
// ❌ Before
useEffect(() => {}, [])

// ✅ After
useEffect(() => {
  // Intentionally empty - runs only on mount
}, [])
```

## Running Lint Checks

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint errors
pnpm lint:fix

# Format code with prettier
pnpm format

# Run all pre-commit checks
pnpm precheck
```

## Pre-commit Hooks

This project uses **Husky** and **lint-staged** to automatically run ESLint and Prettier on staged files before commit. If you have lint errors, the commit will fail:

```
✔ lint-staged 4.0.0
❌ lint-staged: Command failed with exit code 1.
❌ Linting and formatting errors detected.
```

**To fix:** Run `pnpm lint:fix` and commit again.

## Testing Rules are Relaxed

Test files (`.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`) have relaxed rules:

- `@typescript-eslint/no-explicit-any` is a warning instead of an error
- This allows for more flexible test setup with mocks

```typescript
// ✅ ALLOWED in test files (warning only)
vi.mock('@repo/ui', {
  default: any,
})
```

## Type Checking

Run type checking to catch additional issues:

```bash
pnpm typecheck
```

This runs TypeScript in strict mode across the project.

## Best Practices

1. **Always define types explicitly** - Never use `any` or `unknown` without type guards
2. **Comment intentional empty blocks** - Explains intent to future maintainers
3. **Use type imports** - Use `import type { }` for type-only imports
4. **Handle errors safely** - Always use proper type guards for caught errors
5. **Use @repo/ui for components** - Maintain consistency across UI usage
6. **Use cn() for class names** - Proper conditional styling with tailwind

## Getting Help

If you're unsure about a specific linting error:

1. Check this guide for the rule name
2. Run `eslint --debug` to see which rule is failing
3. Check the [TypeScript ESLint docs](https://typescript-eslint.io/rules/)
4. Ask in code review

---

**Remember:** Strict linting is in place to maintain code quality and consistency. These rules prevent common bugs and make the codebase easier to maintain!
