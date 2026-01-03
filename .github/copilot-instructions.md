**Repository Overview**

- **Type:** Small static frontend project composed primarily of plain HTML files (no build system detected).
- **Primary locations:** root HTML files like [dashboard.html](dashboard.html) and the `frontend/` folder (examples: [frontend/report.html](frontend/report.html), [frontend/login.html](frontend/login.html)).

**Big Picture (What to know quickly)**

- **Single-page fragments:** Many pages are standalone HTML files — changes are usually local to the file and linked pages. Update navigation links across files when renaming or moving a file.
- **No server code present:** There are no obvious backend services or package manifests; assume edits are purely static unless the repo is extended.

**Key Files & Patterns**

- **Top-level entry pages:** [dashboard.html](dashboard.html), [coy_reports.html](coy_reports.html), [daily_employment.html](daily_employment.html).
- **Frontend folder:** [frontend/report.html](frontend/report.html), [frontend/login.html](frontend/login.html), plus several dashboard variants (e.g., [frontend/adjt_dashboard.html](frontend/adjt_dashboard.html)).
- **Inconsistent naming:** Filenames include spaces and punctuation (example: [frontend/Co's%20dashboard.html](frontend/Co's%20dashboard.html)) and misspellings (example: [frontend/adjutant-dashbord.html](frontend/adjutant-dashbord.html)). Handle these carefully when editing or scripting renames.

**How to make safe edits**

- **Edit in-context:** Open the HTML file, update markup, and validate links in a browser. Most pages have inline markup rather than templating.
- **Cross-file updates:** When renaming a file, update all `href` references across the repo. Use a repo-wide search for the filename (case-sensitive) before committing.
- **Example change:** To update the main dashboard title, edit [dashboard.html](dashboard.html) and also check [frontend/Co's%20dashboard.html](frontend/Co's%20dashboard.html) if a similarly named dashboard exists.

**Developer workflows & debugging**

- **No build/test commands detected.** Run pages locally with a simple static server:

```bash
python -m http.server 8000
# or
npx http-server -p 8000
```

- **Debugging:** Use the browser devtools (console/network) for JS/asset issues. For link problems, check for spaces or apostrophes in filenames.

**Project-specific conventions to follow**

- **Edit HTML directly:** Avoid introducing a new build tool without coordinating with the team — this repo appears intentionally simple.
- **Keep filenames stable:** Because many links are literal HTML `href`s, keep filenames exact. When you must rename, prefer hyphens/underscores and update references.
- **Search first:** Use full-text search for problematic characters (e.g., `Co's dashboard` or `adjutant-dashbord`) to find duplicated or misspelled pages.

**Examples for common tasks**

- **Find references to a page:** search for the filename, e.g., `report.html` across the repo.
- **Rename safely:** 1) pick new name (no spaces), 2) update all `href` targets, 3) test via local server, 4) commit.

**When to ask for human help**

- If edits require integrating dynamic data, APIs, or a build step (none found), ask the repo owner — this change expands the project's scope.

If any part of this is unclear or you want additions (example: recommended filename normalizations or a small deploy script), tell me which area to expand and I will iterate.
