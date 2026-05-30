# AI Rules & Tech Stack

## Tech Stack
- **Framework**: TanStack Start (Full-stack React framework with SSR).
- **Language**: TypeScript for type-safe development.
- **Routing**: TanStack Router (File-based routing in `src/routes/`).
- **Data Fetching**: TanStack Query (React Query) for server state management.
- **Backend**: Supabase (PostgreSQL, Auth, Storage) via `@supabase/supabase-js`.
- **Styling**: Tailwind CSS v4 for utility-first styling.
- **UI Components**: shadcn/ui (Radix UI primitives) for accessible, styled components.
- **State Management**: Zustand for lightweight client-side state (e.g., shopping cart).
- **Icons**: Lucide React for consistent iconography.
- **Validation**: Zod for schema validation (used in forms and server functions).

## Library Usage Rules

### Routing & Navigation
- **File-based Routing**: All routes must be created in `src/routes/` using `createFileRoute`.
- **Navigation**: Use the `Link` component or `useNavigate` hook from `@tanstack/react-router`.
- **Layouts**: Use `__root.tsx` for the main app shell and `_layout.tsx` files for nested layouts.

### Data Fetching & Server Logic
- **Client-side Fetching**: Use `useQuery` and `useMutation` from `@tanstack/react-query`.
- **Server Functions**: Use `createServerFn` from `@tanstack/react-start` for server-side logic (API calls, DB operations).
- **Supabase**: Use the client in `src/integrations/supabase/client.ts` for client-side RLS-protected queries. Use `src/integrations/supabase/client.server.ts` for admin operations.

### UI & Styling
- **Styling**: Use Tailwind CSS utility classes exclusively. Avoid writing raw CSS in `styles.css` unless defining theme variables.
- **Components**: Always check `src/components/ui/` for existing shadcn/ui components before building from scratch.
- **Icons**: Use `lucide-react`.
- **Toasts**: Use `toast` from `sonner` for all user notifications and feedback.

### State Management
- **Global State**: Use Zustand (see `src/lib/shop.ts` for example) for state that needs to persist across pages (e.g., Cart, User Preferences).
- **Local State**: Use standard React `useState` or `useReducer` for component-specific state.

### Forms & Validation
- **Validation**: Use Zod schemas for all data validation.
- **Forms**: Use `react-hook-form` with the Zod resolver for complex forms.

### Best Practices
- **SSR Safety**: Be mindful of `window` or `localStorage` access; wrap in `useEffect` or check `typeof window !== 'undefined'`.
- **Performance**: Use `useMemo` and `useCallback` for expensive computations or to prevent unnecessary re-renders in large lists.
- **Responsive Design**: Always use Tailwind's responsive modifiers (`sm:`, `md:`, `lg:`, etc.) to ensure mobile-first compatibility.