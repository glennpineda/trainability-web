# Trainability Website

Marketing website for Trainability. It is a plain static site — HTML, CSS and a little JavaScript — with no build step or dependencies.

## Structure

```
index.html      Page markup and content
styles.css      All styles (light + dark mode via CSS variables)
main.js         Mobile nav toggle and footer year
deploy.sh       FTP deploy script
.env.example    Template for deploy credentials
assets/         Logo and other static assets
```

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Editing

- **Content:** all copy lives in `index.html`, one `<section>` per area (Programs, Approach, About, Contact).
- **Colours:** change the variables at the top of `styles.css` (`--brand`, `--accent`, etc.).
- **Contact email:** replace `hello@trainability.example` in `index.html`. The form currently uses a `mailto:` action; swap in a form service (e.g. Formspree, Netlify Forms) for real submissions.

## Deploying (FTP)

`./deploy.sh` uploads the site over FTP/FTPS/SFTP using `curl`. It reads `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_REMOTE_DIR`, `FTP_PROTOCOL` and `FTP_PORT` from a local `.env` file (copy `.env.example`; `.env` is git-ignored) or from environment variables.

When working in Claude Code on the web, set these as environment variables in the cloud environment settings rather than in a file — the container is temporary and `.env` is never committed.

Any other static host works too — GitHub Pages, Netlify, Vercel or Cloudflare Pages. For GitHub Pages, enable Pages on the repository and point it at the root of the default branch.
