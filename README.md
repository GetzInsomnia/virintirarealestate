# multi-lang-virintira

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

## Production

Build the optimized application and start it in production mode:

```bash
npm run build
npm start
```

## Sitemap

After each build, the [`postbuild`](package.json) script runs
[`next-sitemap`](https://github.com/iamvishnusankar/next-sitemap) to
generate `sitemap.xml` and `robots.txt` under the `public/` directory.
You can also run this step manually:

```bash
npm run postbuild
```

## Locale detection

Language detection is handled by [`middleware.ts`](middleware.ts). The middleware
reads the `Accept-Language` header and redirects visitors to the corresponding
`/[lang]` route. Unsupported languages fall back to the default locale (`th`).


## License

This project is licensed under the [MIT License](LICENSE).
