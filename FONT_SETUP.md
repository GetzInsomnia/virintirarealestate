# Font Setup

This project uses custom fonts via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) without committing binary files to the repository.

## Required Fonts
- **Inter** (`public/fonts/Inter`)
- **Prompt** (`public/fonts/Prompt`)

## Downloading TTFs
1. Visit [Google Fonts](https://fonts.google.com) and search for **Inter**, **Prompt**, and **Noto Sans SC**.
2. Download the TTF variants you need (e.g., Regular, Bold, Italic).
3. Create the following directories if they do not exist:
   - `public/fonts/Inter`
   - `public/fonts/Prompt`
4. Place the downloaded `.ttf` files in the matching folders using the same filenames referenced in `src/styles/fonts.ts`.

> **Note**: `Noto Sans SC` is loaded via `next/font/google` and does not require local files.

## Why not commit fonts?
Font binaries significantly increase repository size and may have licensing restrictions. Instead of committing them, developers should obtain the fonts locally using the steps above.
