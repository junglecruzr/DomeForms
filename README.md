# DomeForms

A standalone, open-source drag-and-drop form builder with a modern tech stack. Built to work on any platform - not just WordPress.

## Features

- **Drag-and-Drop Builder** - Grid-based layout with unlimited column nesting
- **20+ Field Types** - Text, select, checkbox, file upload, signature, calculation, and more
- **Conditional Logic** - Show/hide fields, require fields, calculate values based on user input
- **Multi-Step Forms** - Break complex forms into steps with progress tracking
- **Math Expressions** - Real-time calculations with safe expression evaluation
- **Theme System** - CSS variable-based theming with live preview
- **Integrations** - Email, webhooks, CRM (Mailchimp, HubSpot, etc.), payments (Stripe, PayPal)
- **Embed Anywhere** - Iframe or JS SDK for any website
- **Analytics** - Views, submissions, field analytics, funnel visualization
- **File Uploads** - S3/MinIO storage with presigned URLs
- **Multi-Tenant** - Organizations, workspaces, role-based access

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm |
| **Language** | TypeScript 5.5+ |
| **Frontend** | React 18 + Vite |
| **State** | Zustand + Immer |
| **Drag & Drop** | @dnd-kit |
| **Styling** | Tailwind CSS + CSS Variables |
| **Validation** | Zod |
| **Backend** | Fastify |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Better-auth |
| **File Storage** | MinIO (S3-compatible) |
| **Queue** | BullMQ + Redis |
| **Testing** | Vitest + Playwright |

## Project Structure

```
domeforms/
├── apps/
│   ├── builder-app/       # Form builder dashboard (React)
│   ├── embed-widget/      # Embeddable form widget
│   └── admin-dashboard/   # Admin/analytics dashboard
├── packages/
│   ├── core/              # Shared types, schemas, validation, logic, math
│   ├── builder/           # Builder React components
│   ├── renderer/          # Form rendering engine
│   ├── server/            # Fastify API server
│   ├── plugins/           # Integration plugins
│   ├── ui/                # Shared UI components
│   ├── config/            # Shared ESLint, Prettier, Tailwind configs
│   └── database/          # Prisma schema + client
├── docker/
│   └── docker-compose.yml # Local dev stack
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for local database/services)

### Installation

```bash
# Clone and install
cd domeforms
pnpm install

# Start local services (PostgreSQL, Redis, MinIO, Mailhog)
docker-compose up -d

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start all dev servers
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `MINIO_*` - MinIO/S3 configuration
- `BETTER_AUTH_SECRET` - 32+ character secret for JWT
- `STRIPE_SECRET_KEY` - For payments (optional)
- `SENDGRID_API_KEY` - For emails (optional)

## Development

```bash
# Run all dev servers
pnpm dev

# Run specific app
pnpm --filter=@domeforms/builder-app dev
pnpm --filter=@domeforms/server dev

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format

# Database commands
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema changes
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

## Core Packages

### @domeforms/core
Shared types, Zod schemas, validation engine, conditional logic, math expression parser.

```typescript
import { 
  formDefinitionSchema, 
  validateField, 
  evaluateRule, 
  evaluate 
} from '@domeforms/core';
```

### @domeforms/database
Prisma client with extensions for common queries.

```typescript
import { prisma, extendedPrisma } from '@domeforms/database';
```

### @domeforms/server
Fastify API server with REST endpoints for forms, submissions, themes, integrations, webhooks, analytics.

### @domeforms/builder (WIP)
React components for the drag-and-drop form builder.

### @domeforms/renderer (WIP)
Form rendering engine for embedding forms anywhere.

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Forms | `GET/POST /api/forms`, `GET/PATCH/DELETE /api/forms/:id` |
| Submissions | `GET /api/submissions`, `POST /api/submissions/public` |
| Themes | `GET/POST /api/themes`, `GET/PATCH/DELETE /api/themes/:id` |
| Integrations | `GET/POST /api/integrations`, `GET/PATCH/DELETE /api/integrations/:id` |
| Webhooks | `GET/POST /api/webhooks`, `POST /api/webhooks/receive/:formId` |
| Analytics | `GET /api/analytics/forms/:formId` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Upload | `POST /api/upload/presign`, `POST /api/upload/confirm` |

## License

MIT License - Free for personal and commercial use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Roadmap

- [ ] Builder UI (drag-and-drop canvas, field palette, property panel)
- [ ] Renderer (embeddable form widget with iframe/JS SDK)
- [ ] Admin dashboard (analytics, submission management)
- [ ] Payment integrations (Stripe, PayPal)
- [ ] Email notifications with templates
- [ ] PDF generation
- [ ] Collaborative editing (Yjs)
- [ ] A/B testing
- [ ] Mobile app (React Native)