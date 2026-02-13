# TypeScript Strict Configuration Guide

This document explains the TypeScript strict configuration used alongside ESLint to catch type-related errors at compile time.

## Overview

TypeScript strict mode catches additional type errors that ESLint might miss. Combined with ESLint, it provides comprehensive type safety across the monorepo.

## Recommended tsconfig.json Settings

### For All Packages

```json
{
  "compilerOptions": {
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Safety
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // Module Resolution
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,

    // Target & Format
    "target": "ES2020",
    "module": "ESNext",

    // Output
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",

    // Other Useful Options
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## What Each Strict Option Does

### `strict: true`

Enables all strict type checking options:

- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

### `noImplicitAny`

Prevents variables from having an implicit `any` type:

```typescript
// ❌ ERROR with noImplicitAny
const result = someFunction() // Error: Type is implicitly any

// ✅ CORRECT
const result: string = someFunction()
// OR
const result = someFunction() as string
```

### `strictNullChecks`

Prevents null/undefined without explicit type:

```typescript
// ❌ ERROR with strictNullChecks
function getValue(): string {
  return null // Error: null is not assignable to string
}

// ✅ CORRECT
function getValue(): string | null {
  return null
}
```

### `strictFunctionTypes`

Enforces stricter assignments on function types:

```typescript
// ❌ ERROR with strictFunctionTypes
type Fn = (a: number) => void
const fn: Fn = (a: string | number) => {} // Error

// ✅ CORRECT
type Fn = (a: number) => void
const fn: Fn = (a: number) => {}
```

### `strictPropertyInitialization`

Requires class properties to be initialized:

```typescript
// ❌ ERROR with strictPropertyInitialization
class User {
  name: string // Error: Property must be initialized
}

// ✅ CORRECT - Option 1: Initialize
class User {
  name: string = 'Unknown'
}

// ✅ CORRECT - Option 2: Define in constructor
class User {
  name: string

  constructor(name: string) {
    this.name = name
  }
}

// ✅ CORRECT - Option 3: Make optional
class User {
  name?: string
}
```

### `noImplicitThis`

Prevents implicit `any` for `this`:

```typescript
// ❌ ERROR with noImplicitThis
function getValue() {
  return this.value // Error: 'this' is implicitly any
}

// ✅ CORRECT
function getValue(this: MyType) {
  return this.value
}
```

### `noUnusedLocals`

Flags unused variables as errors:

```typescript
// ❌ ERROR with noUnusedLocals
function calculate(a: number, b: number): number {
  const result = a + b
  const temp = 5 // Error: unused variable
  return result
}

// ✅ CORRECT - Remove unused
function calculate(a: number, b: number): number {
  const result = a + b
  return result
}

// ✅ CORRECT - Prefix with _ if intentional
function calculate(a: number, _b: number): number {
  return a
}
```

### `noUnusedParameters`

Flags unused function parameters:

```typescript
// ❌ ERROR with noUnusedParameters
function handleEvent(event: Event): void {
  console.log('Event occurred')
}

// ✅ CORRECT - Remove parameter
function handleEvent(): void {
  console.log('Event occurred')
}

// ✅ CORRECT - Prefix with _ if intentional
function handleEvent(_event: Event): void {
  console.log('Event occurred')
}
```

### `noImplicitReturns`

Ensures all code paths return a value:

```typescript
// ❌ ERROR with noImplicitReturns
function getValue(x: number): string {
  if (x > 0) {
    return 'positive'
  }
  // Error: Not all code paths return a value
}

// ✅ CORRECT
function getValue(x: number): string {
  if (x > 0) {
    return 'positive'
  }
  return 'non-positive'
}

// ✅ CORRECT - Use never for impossible paths
function getValue(x: number): string {
  if (x > 0) {
    return 'positive'
  }
  const exhaustive: never = x // Ensures all cases are covered
  return exhaustive
}
```

## Common TypeScript Errors & Solutions

### Error: "Property is declared but never used"

```typescript
// ❌ Before
class User {
  private unused: string = 'test'
}

// ✅ After - Remove it
class User {
  // No unused properties
}

// ✅ After - Use it
class User {
  private readonly name: string = 'test'

  getName() {
    return this.name
  }
}
```

### Error: "Object is possibly null"

```typescript
// ❌ Before
function getValue(obj: { value: string } | null) {
  return obj.value // Error: obj might be null
}

// ✅ After - Add null check
function getValue(obj: { value: string } | null) {
  if (!obj) return undefined
  return obj.value
}

// ✅ After - Use optional chaining
function getValue(obj: { value: string } | null) {
  return obj?.value
}
```

### Error: "Parameter is never used"

```typescript
// ❌ Before
function handler(event: Event) {
  console.log('Handler called')
}

// ✅ After - Prefix with underscore
function handler(_event: Event) {
  console.log('Handler called')
}
```

### Error: "Type 'X' is not assignable to type 'Y'"

```typescript
// ❌ Before
const value: string = 42

// ✅ After - Fix the type
const value: number = 42

// ✅ After - Type cast if necessary
const value: string = String(42)
```

## Type Checking Commands

```bash
# Run type checking
pnpm typecheck

# Run type checking in watch mode (if available)
pnpm typecheck --watch

# Check specific file
pnpm typecheck src/file.ts

# Force rebuild cache
pnpm typecheck --force
```

## Integration with ESLint

TypeScript strict mode and ESLint rules work together:

```typescript
// ❌ Fails BOTH ESLint and TypeScript checks
function process(data: any) {
  return data.value // ESLint: no-explicit-any, TypeScript: noImplicitAny
}

// ✅ Passes both
interface Data {
  value: string
}

function process(data: Data): string {
  return data.value
}
```

## Best Practices

1. **Use strict mode everywhere** - Don't disable strict checking
2. **Define interfaces** - Explicit types prevent bugs
3. **Use discriminated unions** - Better than if-checks
4. **Avoid type assertions** - Use proper types instead
5. **Use `unknown` over `any`** - More type safe
6. **Enable all strict flags** - They help catch bugs

## Example: Migrating from `any` to Strict Types

### Step 1: Before (With `any`)

```typescript
function fetchUser(id: any): any {
  return api.get(`/users/${id}`)
}

const user = fetchUser('123')
```

### Step 2: After (Strict Typing)

```typescript
import type { User } from '@repo/shared'

function fetchUser(id: string | number): Promise<User> {
  return api.get(`/users/${id}`)
}

const user: User = await fetchUser('123')
console.log(user.email) // TypeScript knows user has email property
```

## Testing with Strict Types

```typescript
import { describe, it, expect } from 'vitest'
import { processData } from './processor'

describe('processData', () => {
  it('should handle string input', () => {
    const result = processData('hello')
    expect(result).toBe('hello processed')
  })

  it('should handle number input', () => {
    const result = processData(42)
    expect(result).toBe('42 processed')
  })

  // TypeScript catches if we try invalid types:
  // processData(true); // ❌ Error: boolean not assignable
})
```

## Pre-commit Hook

TypeScript checking is part of the `precheck` script:

```bash
# Run all checks including type checking
pnpm precheck

# This runs:
# pnpm lint
# pnpm typecheck
# pnpm build
# pnpm test
```

## Helpful TypeScript Utilities

### Partial Type

```typescript
interface User {
  id: number
  name: string
  email: string
}

// All properties optional
const user: Partial<User> = { name: 'John' }
```

### Required Type

```typescript
interface User {
  name?: string
  email?: string
}

// All properties required
const user: Required<User> = { name: 'John', email: 'john@example.com' }
```

### Readonly Type

```typescript
interface Config {
  readonly apiUrl: string
  readonly timeout: number
}

const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}

// config.apiUrl = 'new'; // ❌ Error: readonly property
```

### Record Type

```typescript
type Status = 'pending' | 'completed' | 'failed'

const statusCounts: Record<Status, number> = {
  pending: 5,
  completed: 10,
  failed: 2,
}
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

**Remember:** Strict TypeScript configuration catches bugs at compile time, saving you from runtime errors!
