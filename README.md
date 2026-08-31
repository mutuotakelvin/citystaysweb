This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Lipa na M-Pesa Sandbox Setup

This implementation is sandbox-only. Copy `.env.example` to `.env.local` and populate it with values from your Neon project and Safaricom Daraja sandbox application. Do not commit `.env.local` or any credentials.

### Neon

Neon supplies both database connection values. Set `DATABASE_URL` to the pooled Neon connection for application queries and `DATABASE_URL_UNPOOLED` to the direct, unpooled connection for Prisma commands where required. Both values belong in `.env.local`:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate status
```

### Daraja

Create a Daraja sandbox application and set `MPESA_ENVIRONMENT=sandbox`, then add its consumer key, consumer secret, shortcode, and passkey to `.env.local`. `MPESA_CALLBACK_URL` must be a public HTTPS URL pointing to the payment callback route. Never put real credentials in `.env.example`, documentation, or source control.

### Local Callback Testing

Start the app locally:

```bash
npm run dev
```

Expose `/api/mpesa/callback` through a public HTTPS tunnel using ngrok or Cloudflare Tunnel. For example:

```bash
ngrok http 3000
# or
cloudflared tunnel --url http://localhost:3000
```

Set `MPESA_CALLBACK_URL` in `.env.local` to the tunnel's HTTPS URL plus `/api/mpesa/callback`, restart the development server, and submit a reservation with Daraja sandbox credentials. Complete or cancel the STK prompt, then verify that the reservation status changes only after the callback is received.

Run the database checks locally with:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate status
node --env-file=.env.local -e "const { neon } = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql\`SELECT 1 AS ok\`.then(console.log).catch((error) => { console.error(error); process.exit(1); });"
```

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
