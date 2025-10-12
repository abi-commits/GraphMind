# Quick Start Guide - GraphMind Frontend

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Structure Quick Reference

```
src/
├── assets/          → Images, fonts, icons
├── components/      → React components
│   ├── features/   → Feature components (HeroCinematic, Features3D)
│   ├── layout/     → Layout components (Logo, Header, Footer)
│   └── ui/         → Base UI components (shadcn/ui)
├── constants/       → App constants (API_BASE_URL, ANIMATION_DURATION)
├── hooks/          → Custom React hooks (use-mobile, use-toast)
├── lib/            → Utilities (cn() for className merging)
├── pages/          → Route pages (Index, Upload, NotFound)
└── types/          → TypeScript types and interfaces
```

## Adding New Features

### 1. Adding a New Page
```typescript
// Create: src/pages/NewPage.tsx
const NewPage = () => {
  return <div>New Page</div>;
};
export default NewPage;

// Update: src/App.tsx
import NewPage from "./pages/NewPage";
// Add route in Routes
<Route path="/new" element={<NewPage />} />
```

### 2. Adding a Feature Component
```typescript
// Create: src/components/features/MyFeature.tsx
export const MyFeature = () => {
  return <div>My Feature</div>;
};

// Export in: src/components/features/index.ts
export { MyFeature } from './MyFeature';

// Use anywhere:
import { MyFeature } from '@/components/features';
```

### 3. Adding Shared Types
```typescript
// Add to: src/types/index.ts
export interface MyData {
  id: string;
  name: string;
}

// Use anywhere:
import { MyData } from '@/types';
```

### 4. Adding Constants
```typescript
// Add to: src/constants/index.ts
export const MY_CONSTANT = 'value';

// Use anywhere:
import { MY_CONSTANT } from '@/constants';
```

### 5. Adding a Custom Hook
```typescript
// Create: src/hooks/use-my-hook.ts
export const useMyHook = () => {
  // hook logic
  return { data };
};

// Use anywhere:
import { useMyHook } from '@/hooks/use-my-hook';
```

### 6. Adding Utilities
```typescript
// Add to: src/lib/utils.ts or create new file
export const myUtil = (input: string) => {
  return input.toUpperCase();
};

// Use anywhere:
import { myUtil } from '@/lib/utils';
```

## Import Aliases

The `@/` alias points to `src/`:
```typescript
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout';
import { HeroCinematic } from '@/components/features';
import { APP_NAME } from '@/constants';
import { Node } from '@/types';
import { cn } from '@/lib/utils';
```

## Styling

- Use Tailwind CSS classes
- Global styles in `src/index.css`
- Component styles use Tailwind utility classes
- Custom animations in `tailwind.config.ts`

## Best Practices

✅ Use TypeScript for type safety
✅ Use barrel exports (`index.ts`) for cleaner imports
✅ Keep components small and focused
✅ Use custom hooks for reusable logic
✅ Place shared types in `src/types/`
✅ Place constants in `src/constants/`
✅ Use `cn()` utility for conditional classNames

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Router](https://reactrouter.com)
