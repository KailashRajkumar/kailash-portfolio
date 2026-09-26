<!-- BUILDER_PLATFORM:BEGIN -->
> [!IMPORTANT]
> This project is connected to [builder platform](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on builder platform's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to builder platform and show up in
> the editor, so keep the branch in a working state.
<!-- BUILDER_PLATFORM:END -->

- Portfolio content (profile, skills, experiences, projects, education) lives in Cloud tables and is edited at /admin-user; never hardcode content. Why: owner updates without code.
- Project images fall back to live-site screenshots (wp mshots) when no upload; admin uploads go to private "portfolio" bucket with long signed URLs, while bundled captures can use public assets. Why: workspace blocks public buckets.
- The home portrait defaults to the bundled owner photo and an admin-uploaded profile.avatar_url overrides it; static GitHub Pages sharing uses its publicly hosted portrait-share.jpg, not the admin upload. Why: social crawlers read prerendered HTML before browser data loads, and private storage URLs cannot reliably serve social previews.
- Projects have an active flag; public reads exclude inactive projects while admins can manage them. Why: unpublished work must not leak into the public portfolio.
