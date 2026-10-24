# NovaTech

NovaTech is an online electronics store built as a practice project with Next.js and React. Users can browse a product catalog, search and filter it, save items to a wishlist, manage a cart and check out. Product, user and order data is stored in Supabase (PostgreSQL).

## Features

- Product catalog with category and brand filtering and price controls
- Search with suggestions
- Product detail overlays
- Cart with quantity updates
- Wishlist for authenticated users
- Checkout form validation (email, phone, recipient details)
- User authentication and profile pages

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Supabase](https://supabase.com/) for the database, authentication and sessions
- [Tailwind CSS](https://tailwindcss.com/) 4 with PostCSS
- [ESLint](https://eslint.org/) 9
- [Geist](https://fonts.google.com/specimen/Geist) and [Geist Mono](https://fonts.google.com/specimen/Geist_Mono) fonts via `next/font`

## Backend (Supabase)

The backend is a Supabase project with SQL tables for the store data. The frontend talks to it through the client in `src/lib/supabase.ts`. The SQL schema is not included in this repository.

## Getting started

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

### Environment variables

Create a `.env.local` file in the project root with the values from your Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project structure

```text
.
├── app/
│   ├── auth/          # Authentication pages
│   ├── components/    # Header, filters, product cards, cart modal
│   ├── hooks/         # Cart, wishlist and product-loading logic
│   ├── profile/       # User profile pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx       # Main storefront page
├── public/
│   └── icons/         # Category icons (SVG)
├── src/
│   └── lib/           # Filtering, validation, Supabase client
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Implementation notes

- **Spec normalization.** `src/lib/filters.ts` normalizes values such as RAM and storage (`8GB`, `8 GB`, `256GB SSD`) so equivalent specs compare consistently in filters.
- **Debounced search.** The search box in `app/page.tsx` waits briefly before updating suggestions, so the list is not recalculated on every keystroke. See [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) and [`useEffect`](https://react.dev/reference/react/useEffect).
- **Input sanitizing.** `src/lib/validation.ts` strips invalid characters and formats phone numbers in the Ukrainian pattern before checkout.
- **Functional state updates.** `app/hooks/useCart.ts` updates the cart from the previous state, which avoids stale values when items are added or removed quickly. See [updating state](https://react.dev/learn/updating-state).
- **CSS transitions.** Cart and modal animations in `app/globals.css` use [`@keyframes`](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) and [`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) instead of an animation library.

## Screenshots

<!-- Add screenshots here -->
