# The Household Ledger

A simple self-hosted budget app: monthly income and expenses (not per-transaction
tracking), a household dashboard with charts, separate sections for Lu and Wife,
and a savings & investments tracker with goal progress.

Everything — the Next.js web server and the SQLite database — runs in a single
Docker container. The database is a single file on a mounted volume, so your
data survives container rebuilds.

## 1. Set up your two accounts

Passwords are stored as bcrypt hashes in environment variables — there's no
sign-up flow, just two fixed accounts.

Generate a hash for each password:

```bash
npm install
npm run hash-password -- "yourPasswordHere"
```

This prints a hash like `$2b$12$...`. You'll need one for each account.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

- `AUTH_SECRET` — a long random string (`openssl rand -base64 48`)
- `LU_USERNAME` / `LU_PASSWORD_HASH`
- `WIFE_USERNAME` / `WIFE_PASSWORD_HASH` / `WIFE_DISPLAY_NAME`

## 3. Run it with Docker Compose

The `docker-compose.yml` in this repo pulls a pre-built image from GitHub
Container Registry (see "Updating the app" below). If you'd rather build the
image directly on the server instead, use `docker-compose.build.yml`:

```bash
docker compose -f docker-compose.build.yml up -d --build
```

Either way, the app will be available on port `3411` (change the port
mapping if you'd rather use something else, or route it through your
existing reverse proxy — Cosmos, in your case).

Your data lives in `./data/budget.db` on the host, mounted into the container.
Back this file up the same way you'd back up any other SQLite-based service —
a simple approach is a nightly `sqlite3 ./data/budget.db ".backup /backup/path"`
cron job, since SQLite's `.backup` command is safe to run while the app is live.

## 4. Put it behind Cloudflare Access (recommended)

Since this holds household financial data, it's worth adding a second gate in
front of the app's own login — Cloudflare Access (free for small teams) — so
the app is never reachable without first clearing Cloudflare's auth check.
Point your tunnel at `http://localhost:3411` (or whatever port you map) and
add an Access policy scoped to just you and your wife's email addresses.

## Updating the app

This repo includes `.github/workflows/build.yml`, which automatically builds
and pushes a Docker image to GitHub Container Registry (GHCR) every time you
push to `main` — so your homelab box never has to run a build itself, it just
pulls the finished image.

**One-time setup after you push this repo to GitHub:**

1. Edit `docker-compose.yml` and replace `ghcr.io/OWNER/REPO:latest` with your
   actual GitHub username and repo name, lowercase (e.g.
   `ghcr.io/luandre/household-ledger:latest`).
2. Push to `main`. The Actions tab will show the build running — it pushes
   the image to GHCR automatically using the repo's built-in `GITHUB_TOKEN`,
   no extra secrets needed.
3. By default, packages published this way are **private**. Either:
   - Go to the package's settings on GitHub and make it public (simplest), or
   - On your homelab box, `docker login ghcr.io` with a
     [personal access token](https://github.com/settings/tokens) that has
     `read:packages` scope, so `docker compose pull` can authenticate.

**From then on, to deploy a change:**

```bash
git push                                  # triggers the build on GitHub
# wait for the Actions run to finish, then on your homelab box:
docker compose pull
docker compose up -d
```

The container restarts with the new image; `./data/budget.db` is untouched
since it lives on a mounted volume, not inside the image.

### A note on schema changes

`schema.sql` uses `CREATE TABLE IF NOT EXISTS`, which only sets up tables on a
fresh database — it won't apply changes (like a new column) to a database
that already exists. If you make a schema change, you'll want a small
migration step alongside it rather than editing `schema.sql` in place, or
your already-running install won't pick up the change. Ask me to set up a
versioned-migrations pattern when you get to that point.

## Local development (without Docker)

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev
```

This runs on `http://localhost:3000` and uses `./data/budget.db` directly.

## Notes on the data model

- Each income/expense entry belongs to a person (Lu or Wife) and a month/year.
  The household Dashboard automatically sums both people's entries.
- Expenses can be marked "repeats monthly" — when a new month has no entries
  yet, the Dashboard offers to copy over last month's recurring items.
- Savings goals track a running balance and (optionally) a target amount.
  Updating a goal's balance snapshots it into history, which feeds the growth
  chart at the bottom of the Savings page.
