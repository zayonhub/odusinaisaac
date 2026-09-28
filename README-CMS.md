# Portfolio CMS v1

This branch migrates the portfolio from hardcoded HTML into a custom Next.js + Supabase CMS while preserving a safe fallback to the current portfolio content.

## 1. Vercel environment variables

Add these in **Vercel > Project > Settings > Environment Variables** for Preview first:

```bash
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=use-a-long-unique-password
ADMIN_SESSION_SECRET=generate-at-least-32-random-bytes
SUPABASE_URL=https://wwuutndlekinlkdgjyao.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-secret-key
SUPABASE_PROJECT_REF=wwuutndlekinlkdgjyao
SUPABASE_STORAGE_BUCKET=portfolio-media
NEXT_PUBLIC_SITE_URL=https://odusinaisaacview.vercel.app
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix and never commit real secrets to GitHub.

## 2. Connected Supabase backend

The CMS is connected to the existing **My portfolio** Supabase project (`wwuutndlekinlkdgjyao`). The new CMS is isolated from legacy tables by using:

- `cms_pages`
- `cms_page_sections`
- `cms_projects`
- `cms_media_assets`
- `cms_site_settings`
- `cms_page_revisions`
- `cms_navigation_items`
- public Storage bucket `portfolio-media`

The database has been seeded with the current Home, Work, About, Experience and Contact pages, plus the current selected projects. Existing legacy Supabase tables were left untouched.

## 3. Admin

Visit `/admin/login`.

Authentication is handled by the Next.js server with `ADMIN_USERNAME` + `ADMIN_PASSWORD`. A signed HttpOnly cookie is used for the admin session. Supabase secret/service-role credentials remain server-side.

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

A page owns an ordered set of `cms_page_sections`. Each section has:

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

Projects have their own metadata but point to `cms_pages` for their case-study layout, so every project can have a different section composition.

## 5. Media uploads

The admin asks the server for a temporary signed upload token, then uploads directly to the Supabase Storage TUS endpoint. Large files therefore do not pass through the Vercel function body. TUS provides retry/resume and progress callbacks.

After upload, the file is registered in `cms_media_assets` and becomes available in page sections and project covers.

## 6. Rollout strategy

Do not delete the old static files yet. The Next.js renderer includes fallback content so Preview can build while production configuration is being verified.

Recommended rollout:

1. Deploy this branch as a Vercel Preview.
2. Add the Preview environment variables.
3. Sign into `/admin`.
4. Upload portfolio media into Media Library.
5. Refine Home, Work, About, Experience, Contact and each case study through the section builder.
6. Verify mobile/desktop and publishing.
7. Merge to `main` only after the CMS copy matches or improves the live site.

## 7. Security notes

- Admin username/password are never hardcoded.
- Admin session cookie is HttpOnly, Secure in production and SameSite=Lax.
- Database writes are server-side only.
- RLS is enabled on all CMS tables.
- No public RLS policies are required because the frontend/admin access data through the server-side client.
- The public frontend reads through the server.
- Storage files are publicly readable for portfolio delivery, but uploads/deletes use signed or server-authorized operations.

## Current implementation status

The CMS backend is connected and seeded on the existing Supabase project. The application branch maps CMS queries to the isolated `cms_*` tables. The remaining deployment requirement is that the real secret values are stored in Vercel Environment Variables, never in GitHub.
