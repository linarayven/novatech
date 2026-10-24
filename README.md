# NovaTech

NovaTech is an online electronics store built as a practice project with Next.js and React. It presents a product catalog, allows search and filtering, supports wishlist and cart flows, and includes checkout form validation and profile-aware behavior through Supabase. The project is structured as a realistic storefront demo with a modern frontend stack and production-friendly patterns.

## What the project does

This project is a storefront application for browsing and purchasing electronics. The main storefront experience is assembled in [app/page.tsx](app/page.tsx), with reusable UI in [app/components](app/components), shared logic in [src/lib](src/lib), and external data access in [src/lib/supabase.ts](src/lib/supabase.ts).

The app includes:
- product browsing with category and brand filtering
- search suggestions and price controls
- product detail overlays
- cart management with quantity updates
- wishlist support for authenticated users
- checkout validation for email, phone, and recipient details

## Why it is useful

NovaTech is useful as a practical example of a modern ecommerce frontend. It demonstrates how to structure a product catalog, manage UI state across a shopping flow, normalize domain data for filtering, and connect the client to a real backend service.

It is especially relevant for developers who want to study:
- state-driven storefront architecture
- reusable component composition
- normalization of product metadata
- client-side validation and user data handling
- integration with a data layer using Supabase

## Tech stack

- [Next.js](https://nextjs.org/) — App Router and frontend framework
- [React](https://react.dev/) — component-driven UI
- [TypeScript](https://www.typescriptlang.org/) — static typing
- [Supabase](https://supabase.com/) — authentication, session access, and data storage
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [PostCSS](https://postcss.org/) — CSS processing pipeline
- [ESLint](https://eslint.org/) — linting and code quality
- [Geist](https://fonts.google.com/specimen/Geist) and [Geist Mono](https://fonts.google.com/specimen/Geist_Mono) — font families loaded through Next.js

## Interesting techniques used

- Product normalization for reliable filtering
  The product specs logic in [src/lib/filters.ts](src/lib/filters.ts) normalizes amount and unit strings such as RAM and storage sizes so values are compared consistently. This avoids mismatches caused by formatting differences such as `8GB`, `8 GB`, or `256GB SSD`.
  - [MDN: Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
  - [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

- Debounced search suggestions
  The search box in [app/page.tsx](app/page.tsx) waits briefly before updating suggestions, which reduces unnecessary processing while typing and keeps the UI responsive.
  - [MDN: setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
  - [MDN: useEffect](https://developer.mozilla.org/en-US/docs/React/Reference/React/useEffect)

- Sanitized user input
  The validation layer in [src/lib/validation.ts](src/lib/validation.ts) strips invalid characters and formats phone numbers into a consistent pattern before checkout. This is helpful in ecommerce flows where form correctness matters.
  - [MDN: String.prototype.replace()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)
  - [MDN: RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

- Functional state updates for cart behavior
  The cart logic in [app/hooks/useCart.ts](app/hooks/useCart.ts) updates state based on the previous value, which helps avoid stale-state bugs when items are added or removed in quick succession.
  - [React: Updating state](https://react.dev/learn/updating-state)

- CSS-driven motion
  The UI styling in [app/globals.css](app/globals.css) uses transforms and animations to provide modal and cart transitions without introducing a heavy animation library.
  - [MDN: @keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes)
  - [MDN: transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

## Notable technologies and libraries

- [Next.js](https://nextjs.org/) — application framework and routing
- [React](https://react.dev/) — UI composition and state management
- [TypeScript](https://www.typescriptlang.org/) — type-safe frontend logic
- [Supabase](https://supabase.com/) — session management and database access
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [PostCSS](https://postcss.org/) — CSS processing
- [ESLint](https://eslint.org/) — linting and static code quality
- [Geist](https://fonts.google.com/specimen/Geist) — main brand/UI font
- [Geist Mono](https://fonts.google.com/specimen/Geist_Mono) — monospace font

## Project structure

```text
.
├── app/
│   ├── auth/
│   ├── components/
│   ├── hooks/
│   ├── profile/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── icons/
├── src/
│   └── lib/
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
├── package-lock.json
└── .next/ (generated locally)
```

- `app/` contains the storefront pages, layout, shared components, and stateful page logic.
- `app/components/` holds reusable elements such as the header, filters, cart modal, and product cards.
- `app/hooks/` centralizes cart, wishlist, and product-loading behaviors.
- `app/auth/` and `app/profile/` handle user access and profile-related flows.
- `public/icons/` stores the storefront SVG assets.
- `src/lib/` contains shared logic for filtering, validation, and Supabase integration.

## Getting started

Requirements:
- Node.js 18+
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Useful scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the project for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs ESLint |

### Environment variables

This project uses Supabase. Add the following values to a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The client is created in [src/lib/supabase.ts](src/lib/supabase.ts).

## Summary

NovaTech is a compact but realistic ecommerce storefront built with a modern React stack. It is a strong example of how to combine product filtering, form validation, state management, and external data access in a single frontend experience.
