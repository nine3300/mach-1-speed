# Quick Reference: Strict Linting Rules

## 🚨 4 Core Rules You MUST Follow

### 1️⃣ NO 'ANY' TYPES

```typescript
❌ const data: any = ...
❌ catch (err: any) { ... }
✅ const data: DataType = ...
✅ catch (err: unknown) { ... }
```

### 2️⃣ NO EMPTY BLOCKS

```typescript
❌ try { ... } catch (e) { }
❌ useEffect(() => { }, [])
✅ try { ... } catch (e) { /* Intentionally empty */ }
✅ useEffect(() => { /* Intentionally empty */ }, [])
```

### 3️⃣ USE @repo/ui

```typescript
❌ import { Button } from '@/components/ui/button'
✅ import { Button } from '@repo/ui'
```

### 4️⃣ SAFE FIREBASE ERRORS

```typescript
❌ catch (err: any) { console.log(err.code) }
✅ catch (err: unknown) {
     const firebaseError = err as { code?: string; message?: string }
     console.log(firebaseError.code)
   }
```

---

## ⚡ Quick Commands

| Command          | Purpose                 |
| ---------------- | ----------------------- |
| `pnpm lint`      | Check lint errors       |
| `pnpm lint:fix`  | Auto-fix lint errors    |
| `pnpm format`    | Format code             |
| `pnpm typecheck` | Check TypeScript errors |
| `pnpm precheck`  | Run all checks          |

---

## 📝 Before Every Commit

```bash
pnpm lint:fix    # Fix errors
pnpm format      # Format code
git commit       # Ready!
```

---

## 🔍 Error Messages & Fixes

| Error                          | Fix                                              |
| ------------------------------ | ------------------------------------------------ |
| "Unexpected any"               | Replace with proper type or `unknown` with guard |
| "Empty block"                  | Add comment: `// Intentionally empty`            |
| "Import should be type import" | Use `import type { X }`                          |
| "Import from @/components/ui"  | Use `import { X } from '@repo/ui'`               |

---

## 💡 Type Guard Template

```typescript
try {
  await operation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message)
  } else if (typeof error === 'string') {
    console.error(error)
  }
}
```

---

## 📚 Full Documentation

- [Developer Handbook](./DEVELOPER_HANDBOOK.md)
- [Strict Linting Guide](./STRICT_LINTING_GUIDE.md)
- [ESLint Setup Guide](./ESLINT_SETUP_GUIDE.md)

---

## 🙋 Common Questions

**Q: Can I use `any`?**
A: No. Use proper types or `unknown` with checks.

**Q: What if the block must be empty?**
A: Add a comment explaining why.

**Q: Where do I import components?**
A: Always from `@repo/ui`.

**Q: How do I handle Firebase errors?**
A: Cast to `{ code?: string; message?: string }`.

---

**Print this and keep it handy!** 📌
