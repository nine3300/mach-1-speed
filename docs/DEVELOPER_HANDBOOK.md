# Strict Linting Developer Handbook

## 🎯 Overview

This monorepo enforces **strict ESLint rules** to maintain high code quality and prevent common bugs. All code must pass these rules before being committed.

### The Four Core Rules

1. **NO 'ANY' TYPES** - Use proper type definitions or `unknown` with type guards
2. **NO EMPTY BLOCKS** - Every empty block needs a comment explaining why
3. **SHADCN UI IMPORTS** - Use `@repo/ui` instead of local component paths
4. **FIREBASE ERROR HANDLING** - Safe error typing for Firebase operations

---

## ✅ Quick Setup (First Time)

```bash
# 1. Install dependencies
pnpm install

# 2. Verify setup
pnpm lint

# 3. You're ready!
```

---

## 🚀 Daily Workflow

### Before You Start Working

```bash
# Ensure lint rules pass
pnpm lint

# Check type errors
pnpm typecheck

# Format code properly
pnpm format
```

### While Coding

Use **VS Code extensions** for real-time feedback:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)

**Recommended VS Code settings:**

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Before Committing

```bash
# Auto-fix lint errors
pnpm lint:fix

# Format code
pnpm format

# Check types one last time
pnpm typecheck

# You're ready to commit!
git commit -m "your message"
```

---

## 🔴 Rule #1: NO 'ANY' TYPES

**What it means:** Never use the `any` type in your code.

### ❌ WRONG

```typescript
// Don't catch with 'any'
try {
  await someOperation()
} catch (error: any) {
  console.log(error.message) // Could be undefined!
}

// Don't accept 'any' parameters
function process(data: any) {
  return data.value
}

// Don't use 'any' for variables
const result: any = getData()
```

### ✅ RIGHT

```typescript
// Use 'unknown' with type guard
try {
  await someOperation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message) // Safe!
  }
}

// Define proper interfaces
interface Data {
  value: string
}

function process(data: Data) {
  return data.value
}

// Let TypeScript infer types
const result = getData() // Result type is inferred correctly
```

### Common Patterns

**Pattern 1: Unknown Error**

```typescript
try {
  await operation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error:', error.message)
  } else if (typeof error === 'string') {
    console.error('Error:', error)
  } else {
    console.error('Unknown error')
  }
}
```

**Pattern 2: Type Guard Function**

```typescript
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value && 'email' in value
}

function processUser(value: unknown) {
  if (isUser(value)) {
    // Now TypeScript knows value is a User
    console.log(value.email)
  }
}
```

**Pattern 3: Multiple Types**

```typescript
type Result = string | number | boolean

function handleResult(result: Result) {
  if (typeof result === 'string') {
    console.log(`String: ${result}`)
  } else if (typeof result === 'number') {
    console.log(`Number: ${result}`)
  } else {
    console.log(`Boolean: ${result}`)
  }
}
```

---

## 🚫 Rule #2: NO EMPTY BLOCKS

**What it means:** All empty blocks need a comment explaining why they're empty.

### ❌ WRONG

```typescript
// Empty catch block - confusing!
try {
  someOperation()
} catch (error) {}

// Empty effect - Why is this here?
useEffect(() => {}, [])

// Empty if statement
if (condition) {
}
```

### ✅ RIGHT

```typescript
// Add a comment explaining why it's empty
try {
  someOperation()
} catch (error) {
  // Intentionally empty - error is logged elsewhere
}

// Explain the intent
useEffect(() => {
  // Intentionally empty - runs only on component mount
}, [])

// Actually do something
if (condition) {
  handleCondition()
}
```

### Real-World Examples

**Pattern 1: Handled Elsewhere**

```typescript
try {
  await fetchData()
} catch (error) {
  // Intentionally empty - error handler is in the controller
}
```

**Pattern 2: Mount/Cleanup Only**

```typescript
useEffect(() => {
  // Intentionally empty - listener cleanup happens automatically
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

**Pattern 3: Intentional Value Ignore**

```typescript
function setup(_unused: ConfigType) {
  // Intentionally doesn't use parameter - kept for API compatibility
  initializeDefaults()
}
```

---

## 🔐 Rule #3: FIREBASE ERROR HANDLING

**What it means:** Always safely handle Firebase errors with proper type casting.

### ❌ WRONG

```typescript
// Unsafe error access
import { signInWithEmailAndPassword } from 'firebase/auth'

async function login(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error: any) {
    // These properties might not exist!
    console.log(error.code)
    alert(error.message)
  }
}
```

### ✅ RIGHT

```typescript
import type { AuthError } from 'firebase/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'

async function login(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error: unknown) {
    // Safe casting with type guard
    const firebaseError = error as AuthError

    const message = getErrorMessage(firebaseError.code)
    alert(message)
  }
}

function getErrorMessage(code?: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/invalid-email': 'Invalid email',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password too weak (min 6 chars)',
  }

  return messages[code || ''] || 'Authentication failed'
}
```

### Common Firebase Error Codes

```typescript
const FIREBASE_ERRORS = {
  // Auth Errors
  'auth/user-not-found': 'No account with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-email': 'Invalid email format',
  'auth/email-already-in-use': 'Email already registered',
  'auth/weak-password': 'Password must be 6+ characters',
  'auth/too-many-requests': 'Too many attempts, try later',
  'auth/operation-not-allowed': 'Sign-in method disabled',
  'auth/network-request-failed': 'Network error',

  // Real-time Database Errors
  'permission-denied': 'Permission denied',
  'database-unavailable': 'Database unavailable',

  // Firestore Errors
  'not-found': 'Document not found',
  'already-exists': 'Document already exists',
  unauthenticated: 'Please log in first',
}
```

---

## 📦 Rule #4: SHADCN UI IMPORTS

**What it means:** Always import UI components from `@repo/ui`, not from local paths.

### ❌ WRONG

```typescript
// Wrong: local import path
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

### ✅ RIGHT

```typescript
// Correct: import from @repo/ui
import { Button, Card } from '@repo/ui';

export function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

### Using Conditional Styles with `cn()`

**Pattern: Conditional Classes**

```typescript
import { Button } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

interface ActionButtonProps {
  isActive?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export function ActionButton({
  isActive,
  isDisabled,
  isLoading,
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        'transition-all',
        isActive && 'bg-blue-500 text-white',
        isDisabled && 'opacity-50 cursor-not-allowed',
        isLoading && 'pointer-events-none'
      )}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? 'Loading...' : 'Submit'}
    </Button>
  );
}
```

**Pattern: Variant Classes**

```typescript
import { Card } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

type CardVariant = 'default' | 'highlighted' | 'error';

interface CustomCardProps {
  variant?: CardVariant;
  children: React.ReactNode;
}

export function CustomCard({ variant = 'default', children }: CustomCardProps) {
  const variantClasses: Record<CardVariant, string> = {
    default: 'border-gray-200',
    highlighted: 'border-blue-500 bg-blue-50',
    error: 'border-red-500 bg-red-50',
  };

  return (
    <Card className={cn('p-4', variantClasses[variant])}>
      {children}
    </Card>
  );
}
```

---

## 📋 Complete Checklist Before Committing

- [ ] Code follows all 4 strict rules
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm format` has been run
- [ ] No `// TODO` or `// FIXME` comments left
- [ ] All test cases pass: `pnpm test`

---

## 🛠️ Useful Commands

```bash
# Linting
pnpm lint                # Check lint errors
pnpm lint:fix           # Auto-fix lint errors

# Type Checking
pnpm typecheck          # Check TypeScript errors

# Formatting
pnpm format             # Format all files
pnpm format:check       # Check formatting (don't fix)

# Testing
pnpm test               # Run all tests
pnpm test:coverage      # Run tests with coverage

# Building
pnpm build              # Build all packages

# Pre-commit Check
pnpm precheck           # Run lint + typecheck + build + test
```

---

## 🐛 Troubleshooting

### Problem: "pnpm lint fails on commit"

**Solution:**

```bash
# Fix all auto-fixable issues first
pnpm lint:fix

# Review manual changes
git diff

# Commit again
git commit -m "your message"
```

### Problem: "Unexpected any" Error

**Solution:**
Replace `any` with proper typing:

```typescript
// ❌ Before
function handler(data: any) {}

// ✅ After - Define the type
interface Data {
  id: string
  name: string
}

function handler(data: Data) {}
```

### Problem: "Empty block statement" Error

**Solution:** Add a comment:

```typescript
try {
  operation()
} catch (error) {
  // Intentionally empty - caught by outer handler
}
```

### Problem: "Import should be a type import"

**Solution:** Use `import type`:

```typescript
// ❌ Before
import { MyType } from './types'

// ✅ After
import type { MyType } from './types'
```

### Problem: "Unexpected import from @/components/ui"

**Solution:** Use @repo/ui instead:

```typescript
// ❌ Before
import { Button } from '@/components/ui/button'

// ✅ After
import { Button } from '@repo/ui'
```

---

## 📚 Additional Resources

- [Strict Linting Guide](./STRICT_LINTING_GUIDE.md) - Detailed rule explanations
- [ESLint Setup Guide](./ESLINT_SETUP_GUIDE.md) - Configuration details
- [TypeScript Strict Config](./TYPESCRIPT_STRICT_CONFIG.md) - TypeScript strict mode
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Documentation](https://eslint.org/docs/)

---

## 💡 Pro Tips

1. **Use VS Code extensions** - Real-time feedback while coding
2. **Run `pnpm lint:fix` often** - Auto-fixes save time
3. **Read error messages carefully** - They usually suggest the fix
4. **Ask in code review** - Team leads can help explain rules
5. **Check similar files** - See how others handle edge cases

---

## Questions?

1. Check the detailed guides in this folder
2. Run `eslint --debug` to see which rule is failing
3. Use `pnpm lint --help` for more options
4. Ask your team lead or in GitHub discussions

---

**Remember:** These rules exist to prevent bugs and improve code quality. They make our codebase more maintainable and easier to debug!

_Last Updated: February 13, 2026_
