# Portfolio CMS v1

This branch migrates the portfolio from hardcoded HTML into a custom Next.js + Supabase CMS while preserving a safe fallback to the current portfolio content.

## 1. Vercel environment variables

Add these in **Vercel > Project > Settings > Environment Variables** for Preview first:

```bash
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=use-a-long-unique-password
ADMIN_SESSION_SECRET=generate-at-least-32-random-bytes
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
SUPABASE_STORAGE_BUCKET=portfolio-media
NEXT_PUBLIC_SITE_URL=https://your-preview-or-production-domain
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix and never commit real secrets to GitHub.

## 2. Create the CMS schema

Open the existing Supabase project used by the portfolio and run:

`supabase/migrations/001_portfolio_cms.sql`

This creates:

- `pages`
- `page_sections`
- `projects`
- `media_assets`
- `site_settings`
- `page_revisions`
- `navigation_items`
- public Storage bucket `portfolio-media`

The migration seeds the current homepage and three current featured projects only if the new CMS tables are empty.

## 3. Admin

Visit `/admin/login`.

Authentication is handled by the Next.js server with `ADMIN_USERNAME` + `ADMIN_PASSWORD`. A signed HttpOnly cookie is used for the admin session. Supabase service-role credentials remain server-side.

The dashboard provides:

- Page create/edit/delete/duplicate
- Draft/publish state
- Page SEO fields
- Section create/edit/delete/duplicate/hide
- Drag-and-drop section ordering
- Hero, text, split, image, gallery, project-grid, CTA, divider and spacer sections
- Gallery add/remove/duplicate/reorder controls
- Project create/edit/delete/duplicate/publish
- Shared Media Library
- Bulk resumable uploads with progress through Supabase TUS
- Image alt text and captions
- Revision snapshot every time a page/project is published
- Site settings

## 4. Content model

A page owns an ordered set of `page_sections`. Each section has:

```json
{
  "type": "hero",
  "variant": "editorial",
  "content": {},
  "settings": {},
  "position": 10,
  "is_visible": true
}
```

The frontend renderer maps the section type to a React component. This lets page layout change from the admin without editing code.

Projects have their own metadata but point to the same `pages` table for their case-study layout, so every project can have a different section composition.

## 5. Media uploads

The admin asks the server for a temporary signed upload token, then uploads directly to the Supabase Storage TUS endpoint. Large files therefore do not pass through the Vercel function body. TUS provides retry/resume and progress callbacks.

After upload, the file is registered in `media_assets` and becomes available in page sections and project covers.

## 6. Migration strategy

Do not delete the old static files yet. The Next.js renderer includes fallback content so Preview can build before Supabase is fully configured.

Recommended rollout:

1. Deploy this branch as a Vercel Preview.
2. Add Preview environment variables.
3. Run the SQL migration.
4. Sign into `/admin`.
5. Upload the current portfolio media into Media Library.
6. Rebuild Home, Work, About, Experience, Contact and each case study through the section builder.
7. Verify mobile/desktop and publishing.
8. Merge to `main` only after the CMS copy matches or improves the live site.

## 7. Security notes

- Admin username/password are never hardcoded.
- Admin session cookie is HttpOnly, Secure in production and SameSite=Lax.
- Database writes are server-side only.
- RLS is enabled on all CMS tables.
- The public frontend reads through the server.
- Storage files are publicly readable for portfolio delivery, but uploads/deletes use signed or service-role operations.

## Current implementation status

The CMS foundation and core CRUD/page-builder/media workflows are implemented on `cms-nextjs-v1`. The next production pass should migrate all existing static pages and project media into the CMS, then refine the dashboard UI based on real editing usage.
