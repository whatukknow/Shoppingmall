This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Fonts

The English brand wordmark and display headings use the locally hosted **BBH Hegarty** font through [`next/font/local`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts).

- Font file: `app/fonts/BBHHegarty-Regular.ttf`
- License: `app/fonts/OFL.txt` (SIL Open Font License)
- Loader and CSS variable: `app/layout.tsx` registers `--font-bbh-hegarty`.
- Shared Tailwind font token: `font-heading`, mapped in `app/globals.css`.

Use `className="font-heading"` for English display text, for example:

```tsx
<h1 className="font-heading">Little Portions</h1>
```

Korean text uses the Noto Sans KR body font and fallback because BBH Hegarty is intended for the English display style. Keep the font file and its license together if moving or replacing the font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
