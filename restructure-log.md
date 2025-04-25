# DapperFoxes Website File Restructure Log

This log details the file reorganization performed on April 24, 2025.

## Directory Creation:
- Created `src/`
- Created `src/pages/`
- Created `src/js/`
- Created `scripts/`
- (`docs/` already existed)

## File Moves:

**HTML Files (Moved to `src/pages/`)**
- `index.html` → `src/pages/index.html`
- `events.html` → `src/pages/events.html`
- `poll.html` → `src/pages/poll.html`
- `registry.html` → `src/pages/registry.html`
- `rsvp.html` → `src/pages/rsvp.html`
- `photos.html` → `src/pages/photos.html`
- `AdminInterface.html` → `src/pages/AdminInterface.html`

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

**HTML Files (`src/pages/*.html`)**
- Updated CSS link: `href="css/main.css"` → `href="../css/main.css"` (in 6 files)
- Updated JS link: `src="js/main.js"` → `src="../js/main.js"` (in 5 files)
- Updated Favicon link: `href="foxes-favicon.ico"` → `href="../foxes-favicon.ico"` (in 6 files)

**JavaScript File (`src/js/main.js`)**
- Updated fetch path for official photos: `fetch(\`official-photos.json?_=\${cacheBuster}\`)` → `fetch(\`../../official-photos.json?_=\${cacheBuster}\`)`

**TypeScript Config (`tsconfig.json`)**
- Updated include path: `"js/*.js"` → `"src/js/*.js"`

**Apps Script Files (`scripts/*.gs`)**
- No changes needed as they reference external Google services/IDs.