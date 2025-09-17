# Admin Guide

## Workspace backups

Open the **Admin workspace** from `/adminmanager` and switch to the **Settings** tab to download
an on-demand archive of the CMS data. Click **Backup now** to trigger a `GET /api/admin/backup`
request; the interface automatically attaches the admin CSRF token.

The server builds the ZIP stream in real time and includes:

- `prisma/dev.db`, when the development database file exists
- All JSON payloads stored at `public/data/*.json`
- The 20 most recent assets from `public/uploads/processed`

Before running a backup ensure that the Next.js process has read permissions for each of those
paths. If a directory is missing the archive simply omits that section.
