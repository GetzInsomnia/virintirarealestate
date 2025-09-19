# ENV

## Present env files
- ✅ .env
- ❌ .env.local
- ❌ .env.example
- ❌ .env.development
- ❌ .env.production

## src/env.ts keys (best-effort)

| Key | Type/Default |
|---|---|
| `NODE_ENV` | z.enum(['development', 'test', 'production']).default( |
| `NEXT_PUBLIC_API_URL` | z.string |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | z.enum(['th','en','zh']).default( |