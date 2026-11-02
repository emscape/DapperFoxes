# DapperFoxes Website File Restructure Log

This log details the file reorganization performed on April 24, 2025.

## Directory Creation:
- Created `src/`
- Created `src/js/`
- Created `scripts/`
- (`docs/` already existed)

## File Moves:

**HTML Files**
- The HTML pages stay at the repository root (GitHub Pages serves them from there).

**JavaScript Files**
- `js/main.js` → `src/js/main.js`
- `generate-photo-list.js` → `scripts/generate-photo-list.js`

**Apps Script Files (Moved to `scripts/`)**
- `photo-gallery-script.gs` → `scripts/photo-gallery-script.gs`
- `comments-backend.gs` → `scripts/comments-backend.gs`

**Documentation Files (Moved to `docs/`)**
- `comments-backend-setup.md` → `docs/comments-backend-setup.md`
- `our-story-sean-edit.md` → `docs/our-story-sean-edit.md`
- `our-story.md` → `docs/our-story.md`
- `photo-gallery-official-plan.md` → `docs/photo-gallery-official-plan.md`
- `photo-upload-plan.md` → `docs/photo-upload-plan.md`
- `poll-comments-implementation-plan.md` → `docs/poll-comments-implementation-plan.md`
- `proposal-story.md` → `docs/proposal-story.md`

**Image Directory**
- `images/weddingwebsite/` was already correctly named (lowercase). No move/rename needed.

## File Content Updates:

**HTML Files (repository root)**
- Updated JS link: `src="js/main.js"` → `src="src/js/main.js"`
- Four pages link the stylesheet and favicon as `../css/main.css` and `../foxes-favicon.ico`; from the site root these resolve to `/css/main.css` and `/foxes-favicon.ico`.

**JavaScript Files (`src/js/`)**
- Added `src/js/paths.js` to centralize Apps Script URLs and asset paths; `official-photos.json` is loaded from the site root (`/official-photos.json`).

**TypeScript Config (`tsconfig.json`)**
- Updated include path: `"js/*.js"` → `"src/js/*.js"`

**Apps Script Files (`scripts/*.gs`)**
- No changes needed as they reference external Google services/IDs.