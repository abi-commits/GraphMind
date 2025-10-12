# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/89bbd5bf-9f78-4569-b7c0-f0dc3463cff2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/89bbd5bf-9f78-4569-b7c0-f0dc3463cff2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/89bbd5bf-9f78-4569-b7c0-f0dc3463cff2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Project Structure

The frontend follows a well-organized structure for better maintainability:

```
frontend/
├── public/              # Static files served directly
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── components/     # React components
│   │   ├── features/   # Feature-specific components
│   │   │   ├── HeroCinematic.tsx
│   │   │   ├── Features3D.tsx
│   │   │   └── index.ts
│   │   ├── layout/     # Layout components
│   │   │   ├── Logo.tsx
│   │   │   └── index.ts
│   │   ├── ui/         # shadcn/ui components
│   │   └── index.ts
│   ├── constants/      # Application constants
│   │   └── index.ts
│   ├── hooks/          # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/            # Utility functions
│   │   └── utils.ts    # cn() utility for className merging
│   ├── pages/          # Page components (routes)
│   │   ├── Index.tsx
│   │   ├── Upload.tsx
│   │   └── NotFound.tsx
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── components.json     # shadcn/ui configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

### Key Directories

- **`src/components/features/`** - Feature-specific components like HeroCinematic and Features3D
- **`src/components/layout/`** - Layout components like Logo, Header, Footer
- **`src/components/ui/`** - Base UI components from shadcn/ui
- **`src/lib/`** - Utility functions (e.g., `cn()` for className merging)
- **`src/types/`** - Shared TypeScript types and interfaces
- **`src/constants/`** - Application-wide constants
- **`src/hooks/`** - Custom React hooks
- **`src/pages/`** - Page-level components for routing

For more details, see [src/README.md](./src/README.md).
