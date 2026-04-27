---
description: Draft a release note and run the release workflow for the ownplate / Omochikaeri.com project (uses docs/news/current.md convention)
---

## Ownplate Release

This skill drafts a release note for `Nakajima-Foundation/ownplate` following the project's `docs/news/` convention, then runs the workflow that publishes it to `docs/RELEASES.md` and `src/app/admin/News/data.ts`.

Use this when the user asks to "リリースノートをつくって" / "v_X.Y.Z_ を出したい" / "make a release note" in this repo.

### How the project's release-note machinery works (read once, then follow)

- `docs/news/current.md` is the **template skeleton** (`:title:` placeholder + empty `- 管理系` / `- ユーザー系` headers). It stays in the repo unchanged and is the shape every release copies from. **Do not write the release content into `current.md`.**
- For each release, create a **new file** `docs/news/YYYYMMDD.md` with the actual content. Line 1 = title (e.g. `vX.Y.Z をリリースしました。`), rest = markdown body.
- `yarn makenews` runs `batch/news.js`, which:
  - Concatenates every `YYYYMMDD.md` file (sorted desc, ignoring `current.md`) into `docs/RELEASES.md`
  - Writes a structured array to `src/app/admin/News/data.ts` (consumed by the admin News page)
- `docs/NEWS.md` documents this — re-read it if you suspect the format changed. (Note: its wording about "editing current.md over time" is aspirational; in practice releases are written directly into the dated file.)

### Pre-release checks

1. **Confirm we're in the ownplate repo and on a clean tree**:
   ```bash
   git rev-parse --show-toplevel
   git status
   git branch --show-current
   ```
   The working tree should be clean and on `main` (or whatever feature branch the user is preparing the release on — confirm with them).

2. **Get current version + last release tag**:
   ```bash
   jq -r .version package.json
   git tag --list 'v*' --sort=-v:refname | head -3
   ```

3. **Ask the user**: which version (patch / minor / major) and what's the **headline** of this release. The headline drives the intro paragraph and the order of bullets.

4. **Confirm the release date with the user.** Never assume "today". Releases at this project are typically cut **翌朝 (the next morning)** or on a scheduled date, not the moment the note is drafted. Ask: "リリース日はいつですか？（翌朝？）" and use the answer for both the filename (`YYYYMMDD.md`) and the heading (`## vX.Y.Z (YYYY/MM/DD)`). Default assumption: 翌朝 = `date -v+1d`.

### Drafting the release note

1. **Resolve the release date** (use the date the user gave in the pre-check; if they said "明日朝", run `date -v+1d "+%Y/%m/%d"` and `date -v+1d "+%Y%m%d"`). Always cross-check with `date` — never guess from session context.

2. **Survey changes since the last release tag** to figure out what to include:
   ```bash
   LAST=$(git tag --list 'v*' --sort=-v:refname | head -1)
   git log "$LAST"..HEAD --pretty=format:"%h %s" --no-merges | head -80
   ```
   Read every line. Then **filter aggressively for end-user impact** before writing anything (see "User-perspective filter" below). The release note is read by 加盟店 owners and customers via the in-app News page (`/admin/news`), not by engineers — so most commits in `git log` will not make the cut.

3. **User-perspective filter** — what to include vs. drop:

   **Include** (things a non-technical user notices when using the site):
   - New features visible in the UI (new pages, new buttons, new options, new languages)
   - Behavior changes the user experiences (flow changes, payment screen changes, new required fields)
   - Bug fixes the user actually hit (visible errors, broken displays, wrong data)
   - Important announcements (sunset notices, terms changes, scheduled breaking changes)
   - Pricing / fee / payment-handling changes

   **Drop** (engineer-only / invisible to users):
   - Dependency bumps (`Bump xxx from ... to ...`, package updates)
   - Build/runtime upgrades (Node.js / TypeScript / Vite / Tailwind / rollup versions)
   - Internal refactors (`refactor: remove any`, `refactor: improve type safety`)
   - Lint / ESLint rule changes
   - Test additions (Playwright E2E, unit tests)
   - CI/CD changes (GitHub Actions, deploy cache)
   - Internal tooling (batch scripts, code generators, regen workflows)
   - Translation infrastructure / batch tooling (the *added languages* are user-facing; the *tooling that produced them* is not)

   When in doubt, ask: "would 加盟店オーナー or an ordinary customer notice the difference if this change were reverted?" If no, drop it.

4. **Create `docs/news/YYYYMMDD.md` directly** — do NOT modify `docs/news/current.md`. Use the **release date** (from step 1), not today's date. Shape (see `docs/news/20251129.md`, `20250123.md`, `20240731.md` for reference):
   ```markdown
   vX.Y.Z をリリースしました。

   ## vX.Y.Z (YYYY/MM/DD)

   （任意の導入文：major リリースは入れる、patch は省略可。1〜2文で十分）

   - ユーザー系
     - …

   - 管理系
     - …

   - 共通
     - …
   ```
   Rules:
   - Line 1 is the title — `news.js` reads it as `title`. Do not skip.
   - Use Japanese. Match the terse style of past entries; one bullet per change, no over-explaining.
   - **Omit any section that has no bullets after filtering.** It's fine for a release to have only `- ユーザー系` (e.g., a UI-only release) or to skip `- 共通` entirely. Past releases regularly have just one section.
   - For behavior changes or anything that affects existing flows, add a sub-bullet explaining the new flow (see v3.0.7 for the gold-standard format).
   - Image references like `![…](/images/news/YYYYMMDD/foo.png)` are allowed; place the image under `public/images/news/YYYYMMDD/`.

5. **Show the draft to the user and stop**. Do not run `makenews`, tag, or push until they approve. Major releases especially deserve a review pass — the user will often ask to drop infra/internal items even after filtering.

### After approval — prepare the release-note PR

1. **Cut a release branch from `main`** (never commit the release note directly on `main` or on an unrelated feature branch):
   ```bash
   git fetch origin
   git checkout -b release-vX.Y.Z origin/main
   ```
   Then write the new `docs/news/<RELEASE_YYYYMMDD>.md` file on this branch (see the "Drafting" section — draft on whatever branch was convenient, but the final committed copy lives on the release branch).

2. **Run `yarn makenews`** to regenerate `docs/RELEASES.md` and `src/app/admin/News/data.ts` from all `YYYYMMDD.md` files:
   ```bash
   yarn makenews
   ```
   Verify both files now include the new entry at the top. The generated `data.ts` entry's `title` is line 1 of the news file; confirm it reads `vX.Y.Z をリリースしました。`.

3. **Run `yarn format`** to prettify the generated `data.ts` (it's machine-emitted so prettier often normalizes it). Important:
   ```bash
   yarn format
   ```
   `yarn format` runs project-wide and may also touch unrelated files that were left unformatted on `main`. **Keep the release-note commit scoped** — only stage `docs/news/<date>.md` + the regenerated outputs. If format touched other files, revert them with `git checkout -- <paths>` so they don't pollute the release PR. Those are a separate hygiene concern.

4. **Commit on the release branch.** Everything goes into one commit (the news file + the regenerated outputs). Do **not** stage `docs/news/current.md`. Add files individually, never `git add -A`:
   ```bash
   git add docs/news/<RELEASE_YYYYMMDD>.md docs/RELEASES.md src/app/admin/News/data.ts
   git commit -m "chore: add vX.Y.Z release note"
   git push -u origin release-vX.Y.Z
   ```
   (If `yarn format` produces further data.ts-only churn after the commit, amend with `git commit --amend --no-edit` + `git push --force-with-lease`. Since the release branch only has one commit and the user has explicitly asked for a tight release-note commit, amend is acceptable here.)

5. **Open a PR** so the release note gets reviewed before merge:
   ```bash
   gh pr create --base main --title "chore: add vX.Y.Z release note" --body "<release-note body or summary>"
   ```

### After the PR is merged — tag & GitHub release

The user often does this themselves right before the release goes live. Only run these if they explicitly ask.

1. **Bump `package.json` version** to the new vX.Y.Z on `main` (usually a separate tiny commit directly on main or another PR):
   ```bash
   # edit package.json "version" field
   git add package.json
   git commit -m "chore: bump version to X.Y.Z"
   ```

2. **Tag from the merge commit** and push:
   ```bash
   git checkout main && git pull
   git tag vX.Y.Z
   git push origin --tags
   ```

3. **Create GitHub release** with the news entry as the body:
   ```bash
   gh release create vX.Y.Z --repo Nakajima-Foundation/ownplate \
     --title "vX.Y.Z" \
     --notes-file docs/news/<RELEASE_YYYYMMDD>.md
   ```
   (Or pass `--notes` with a hand-crafted English summary if the audience is broader than Japanese-only. Ask the user.)

### Important rules

- MUST run `date` for the date — never guess from session context.
- MUST confirm the **release date** with the user (not today's date). Default: 翌朝.
- MUST NOT push, tag, or run `makenews` until the user has approved the draft.
- MUST add files individually (never `git add -A` / `git add .`).
- MUST keep section names exactly `ユーザー系` / `管理系` / `共通` so that data.ts stays consistent with past entries.
- MUST write only **user-visible** changes in the release note (see "User-perspective filter"). Infra / refactor / deps bumps do not belong here.
- MUST NOT amend a previous release's news file after `makenews` has shipped — write a follow-up entry instead.
- MUST NOT include unrelated format churn from `yarn format` in the release-note commit — revert those files and let them be cleaned up separately.
- If `package.json` and the release tag drift apart, fix `package.json` first and tag from that commit; never force-push a tag.
