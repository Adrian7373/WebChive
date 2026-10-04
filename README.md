# WebChiver

WebChiver is a local-first read-it-later application for archiving web articles. Save an article URL from the Chrome extension or the API, extract the main content, convert it to Markdown, and read or search the cleaned article from the React dashboard.

## Features

- Archive the active browser tab from the Chrome extension.
- Extract article content with Mozilla Readability and JSDOM.
- Convert extracted HTML to Markdown with Turndown.
- Store articles and reusable tags in PostgreSQL through Prisma.
- Search saved articles by title or content.
- Read saved articles as rendered Markdown.
- Delete saved articles from the dashboard.
- Calculate an estimated reading time from the extracted text.

## Architecture

```text
Chrome extension ─┐
                  ├──> Express API ───> Mozilla Readability/JSDOM
React dashboard ──┘             │
                                ├──> Turndown (HTML → Markdown)
                                └──> Prisma ───> PostgreSQL
```

The application currently runs as two local processes:

- **Client:** Vite + React 19 + React Router + TanStack Query + Tailwind CSS
- **Server:** Express 5 + Prisma 7 + PostgreSQL
- **Extension:** Manifest V3 Chrome extension that sends the active tab URL to the local API

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL
- Google Chrome or another Chromium-based browser (optional, for the extension)

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Adrian7373/WebChive.git
cd WebChive
```

### 2. Configure PostgreSQL

Create a PostgreSQL database, then create `server/.env`:

```env
DATABASE_URL="<your PostgreSQL connection string>"
```

Use the credentials, host, port, and database name for your own PostgreSQL installation. Do not commit `.env` files or real credentials.

### 3. Install server dependencies and initialize Prisma

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
```

For local schema development, use `npx prisma migrate dev` instead of `npx prisma migrate deploy`.

### 4. Start the API

From the `server` directory:

```bash
npx tsx server.js
```

The API listens on `http://localhost:3000`.

### 5. Start the client

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The client currently calls the API at `http://localhost:3000` directly, so the API must be running before loading the dashboard.

## Chrome extension

The extension is an optional way to archive the page currently open in Chrome.

1. Start the server on `http://localhost:3000`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository's `extension` directory.
6. Open an article in a tab, click the WebChiver extension, enter comma-separated tags, and select **Archive Article**.

If no tags are entered, the extension assigns the `inbox` tag. The extension is configured for the local API and currently requests access to `http://localhost:3000/*`.

## API

All article routes are mounted under `/api/v1/articles`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/articles` | Fetch and archive an article from `{ "url": "...", "tags": [...] }` |
| `GET` | `/api/v1/articles` | List articles, newest first |
| `GET` | `/api/v1/articles?q=term` | Search article titles and Markdown content |
| `GET` | `/api/v1/articles/:id` | Fetch one article, including its full content |
| `DELETE` | `/api/v1/articles/:id` | Delete an article |

Example archive request:

```bash
curl -X POST http://localhost:3000/api/v1/articles ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://example.com/article\",\"tags\":[\"inbox\",\"reading\"]}"
```

On macOS/Linux, use `\` instead of `^` for line continuation, or send the request as a single line.

## Data model

Prisma manages two application models:

- **Article:** original URL, title, author/byline, excerpt, Markdown content, estimated reading time, archive state, and creation time.
- **Tag:** unique tag names connected to articles through an implicit many-to-many relationship.

The initial migration is stored in [`server/prisma/migrations`](./server/prisma/migrations), and the schema is defined in [`server/prisma/schema.prisma`](./server/prisma/schema.prisma).

## Project structure

```text
.
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Searchable article list and delete actions
│   │   │   └── Reader.tsx      # Article reader and Markdown rendering
│   │   ├── App.jsx             # Client routes
│   │   └── main.jsx            # React, router, and query-client entry point
│   ├── package.json
│   └── vite.config.js
├── extension/
│   ├── manifest.json           # Manifest V3 configuration
│   ├── popup.html              # Extension popup UI
│   └── popup.js                # Active-tab archive request
├── server/
│   ├── controllers/
│   │   └── articles.controller.js
│   ├── routes/
│   │   └── articles.js
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── db.ts                   # Prisma PostgreSQL client
│   ├── server.js               # Express entry point
│   └── package.json
└── README.md
```

## Available commands

### Client

```bash
npm run dev       # Start Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

### Server

```bash
npx tsx server.js       # Start the API
npx prisma generate     # Generate the Prisma client
npx prisma migrate dev  # Create/apply a development migration
npx prisma migrate deploy
```

The server package does not currently define a `start` script or automated test suite.

## Development notes

- The client and extension use the local API URL directly rather than an environment-based API configuration.
- CORS is enabled by the Express server for local development.
- Article extraction depends on the target site being fetchable by the server and parseable by Readability.
- The generated Prisma client is produced under `server/generated/prisma` and should be regenerated after schema changes.
