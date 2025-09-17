# Zomzom Property

A small Next.js 14 project that demonstrates a bilingual web site using `next-i18next`.

## Requirements

- Node.js 18 or newer

## Installation

Install dependencies:

```bash
npm install
```

Run the above command before executing `npm run dev`, `npm run build`,
or `npm run lint`. These scripts require all dependencies to be installed.

## Environment variables

Set `NEXT_PUBLIC_SITE_URL` to the fully qualified URL of your deployed site:

```bash
NEXT_PUBLIC_SITE_URL=https://www.zomzomproperty.com
```

This value is used when generating SEO metadata and the sitemap so that all
links include an absolute URL.

Set `WATERMARK_ENABLED` to `true` to apply a text watermark when processing uploads:

```bash
WATERMARK_ENABLED=true
```

When omitted or `false`, uploads are stored without a watermark.

Customize the watermark text with `WATERMARK_TEXT`:

```bash
WATERMARK_TEXT="Your brand here"
```

If not set, the default is `"Zomzom Property"`.


## Development

Start a development server with hot reload:

```bash
npm run dev
```

## Linting

Check code quality using ESLint:

```bash
npm run lint
```

`npm run lint` expects a `.eslintrc.json` file that extends
`next/core-web-vitals` in the project root.

## Production

Build the optimized application and start it in production mode:

```bash
npm run build
npm start
```

## Sitemap

Use [`next-sitemap`](https://github.com/iamvishnusankar/next-sitemap) to
generate `sitemap.xml` and `robots.txt` under the `public/` directory after
every production build:

```bash
npm run build
npm run sitemap
```

Re-run the sitemap step whenever you add or remove pages.

## Exchange rates

Refresh currency conversion data used by the site:

```bash
npm run update:rates
```

This script downloads the latest daily rates from the European Central Bank
and writes them to `public/data/rates.json`. If the network request fails, the
existing file remains unchanged.

## Locale detection

Language detection is handled by [`middleware.ts`](middleware.ts). When a path
lacks a locale prefix, the middleware parses the request's `Accept-Language`
header using [`negotiator`](https://www.npmjs.com/package/negotiator) to choose
the best match among the supported locales (`th`, `en`, `zh`). If none of the
preferred languages match or the header is missing, the middleware redirects to
the default locale (`th`).


## API

### GET `/api/suggest`

Returns search suggestions used by the client. If the suggestions file cannot
be read, the endpoint responds with HTTP 500.


## License

This project is licensed under the [MIT License](LICENSE).
