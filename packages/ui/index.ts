// =============================================================================
// @repo/ui - The Shared Component Closet
// =============================================================================
//
// 🎭 ANALOGY: This is like a shared wardrobe in a theater production.
// All the actors (apps) can come here to borrow costumes (components)
// instead of each making their own from scratch!
//
// This package contains:
// - Custom components (Header, Counter)
// - Shadcn UI components (Button, Card, Dialog, Badge, etc.)
// - Utility functions (cn for class merging)
// =============================================================================

// Custom Components
export { Header } from './components/Header'
export { Counter } from './components/Counter'

// Shadcn UI Components
export { Button, buttonVariants } from './components/ui/button'
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card'
export { Toaster } from './components/ui/sonner'
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog'
export { Badge, badgeVariants } from './components/ui/badge'
export { Checkbox } from './components/ui/checkbox'
export { ScrollArea, ScrollBar } from './components/ui/scroll-area'
export { Input } from './components/ui/input'

// Utilities
export { cn } from './lib/utils'
