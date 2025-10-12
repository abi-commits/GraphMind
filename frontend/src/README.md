# Frontend Source Structure

This directory contains the source code for the GraphMind frontend application.

## Directory Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable React components
│   └── ui/         # shadcn/ui components
├── constants/       # Application-wide constants
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and helpers
├── pages/          # Page components (routes)
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── index.css       # Global styles
```

## Key Files

- **`lib/utils.ts`** - Contains the `cn()` utility for className merging (required by shadcn/ui)
- **`types/index.ts`** - Shared TypeScript interfaces and types
- **`constants/index.ts`** - Application constants and configuration

## Component Organization

### UI Components (`components/ui/`)
These are the base UI components from shadcn/ui. They should not be modified directly unless customizing the design system.

### Feature Components (`components/`)
Custom components specific to the application:
- `Logo.tsx` - Application logo component
- `HeroCinematic.tsx` - Animated hero section
- `Features3D.tsx` - 3D features showcase

### Pages (`pages/`)
Route-level components:
- `Index.tsx` - Landing page
- `Upload.tsx` - File upload page
- `NotFound.tsx` - 404 error page

## Adding New Features

1. Create new components in `components/` or feature-specific subdirectories
2. Add shared types to `types/index.ts`
3. Define constants in `constants/index.ts`
4. Create custom hooks in `hooks/`
5. Add utility functions to `lib/`

## Styling

- Uses Tailwind CSS for styling
- Global styles in `index.css`
- Component-specific styles should use Tailwind classes
- Custom animations defined in `tailwind.config.ts`
