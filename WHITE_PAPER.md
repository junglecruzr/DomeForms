# Technical White Paper: DomeForms Architecture & Security

**Version:** 1.1  
**Date:** November 14, 2026  
**Author:** Sapiens AI (Agnes)  
**Repository:** https://github.com/your-github-user/DomeForms  

## Abstract
DomeForms is a high-performance, modular form infrastructure designed as a self-hosted alternative to proprietary solutions like WordPress plugins or third-party SaaS providers. It combines a Type-Safe Monorepo architecture with real-time conditional logic and integrated payment processing via Stripe. This document outlines the technical architecture, security principles, and extensibility features that define the platform.

---

## Executive Summary

DomeForms addresses the limitations of traditional form builders by providing:
- **Self-hosted data sovereignty** - No vendor lock-in, full control over user data
- **Multi-tenant architecture** - Organizations, workspaces, and role-based access control
- **Extensible plugin system** - Integration with CRM, email, payment, and messaging platforms
- **Enterprise-grade security** - JWT authentication, HMAC webhook verification, encrypted storage

---

## 1. Architectural Overview
DomeForms is built upon a **Monorepo** philosophy using **Turborepo** for task orchestration and **pnpm workspaces**. This structure ensures atomic updates between the frontend rendering engine, backend API, and core data schemas.

### 1.1 The Core Layer (`packages/core`)
The backbone of the application is the `core` package. It contains all Zod-based validation schemas defining the shape of Forms, Fields, Themes, Integrations, and Submissions. Because this layer is framework-agnostic, it serves as the single source of truth for both the React-based Admin Dashboard and the Server-side Logic.

### 1.2 The Server Layer (`packages/server`)
Built on **Fastify**, the server provides a RESTful API with strict type safety through `fastify-type-provider-zod`. It manages user authentication via **Better Auth**, handles file storage via **MinIO/S3**, and processes payments via the **Stripe SDK**. A key architectural decision was the implementation of a dedicated webhook endpoint with raw-body parsing to ensure secure and immediate state transitions for high-value transactions.

### 1.3 The Renderer Layer (`packages/renderer`)
Unlike traditional builders that output raw HTML, DomeForms uses a component-based renderer package. The frontend `builder-app` imports from `@domeforms/renderer` to provide a consistent preview. This allows forms to be deployed across different hosting environments (Node.js, Vercel, Netlify) while maintaining identical behavior and style integrity.

---

## 2. Security Model
DomeForms adopts a "Trust but Verify" model for external integrations and internal data handling.

*   **Anti-Spam Enforcement**: The public submission endpoint (`/public`) performs mandatory local checks. These include "Honeypot" field detection (identifying bot activity through hidden field population) and conditional verification of CAPTCHA tokens provided by Google or Cloudflare.
*   **Webhook Verification**: All incoming requests from third parties such as Stripe are verified against an HMAC signature stored in environment variables, preventing payload tampering.
*   **Data Sanitization**: All submissions undergo server-side sanitization prior to database insertion, stripping HTML content unless explicitly permitted by the form's admin settings.

---

## 3. Payment Integration Methodology
A distinct advantage of DomeForms over static plugins is its native support for complex payment workflows:

1.  **State Management**: When a form requires payment, the initial submission creates a record in the `SubmissionStatus.PENDING` state.
2.  **Checkout Session Creation**: The API utilizes the Stripe API to generate a secure, time-limited Checkout URL, returning it to the client for redirection.
3.  **Asynchronous Confirmation**: Upon successful payment, Stripe sends a webhook event to the `/webhooks/stripe` route. The server matches the metadata to the original pending submission and transitions the status to `PaymentStatus.PAID`, ensuring no revenue-generating data is lost during network latency issues.

---

## 4. Future Development & Extensibility
The current roadmap focuses on expanding the ecosystem through three primary vectors:
*   **Plugin Marketplace**: Introducing a formal API for community-driven integrations (e.g., Zoho CRM, Twilio SMS).
*   **Edge Deployment**: Migrating the renderer package to utilize WebAssembly (WASM) for edge-network execution.
*   **Visual Grid Designer**: Enhancing the drag-and-drop interface with multi-column nesting and responsive breakpoint adjustments via React Flow.

---

## 5. Current Architecture (As of v1.1)

### 5.1 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + Vite + TypeScript | User interface |
| **State Management** | Zustand + Immer + TanStack Query | Client-side state |
| **Drag & Drop** | @dnd-kit | Builder interaction |
| **Backend** | Fastify | RESTful API server |
| **Database** | PostgreSQL + Prisma ORM | Data persistence |
| **Authentication** | Better-auth + JWT | Secure user management |
| **File Storage** | MinIO (S3-compatible) | File uploads |
| **Build System** | Turborepo + pnpm | Monorepo orchestration |
| **Styling** | Tailwind CSS + Radix UI | Component library |

### 5.2 Project Structure

```
domeforms/
├── apps/
│   └── builder-app/          # Main frontend application
│       ├── src/
│       │   ├── pages/        # Page components
│       │   ├── components/   # Reusable UI components
│       │   ├── context/      # React context providers
│       │   ├── utils/        # API utilities
│       │   └── types/        # TypeScript definitions
│       └── dist/             # Compiled output
├── packages/
│   ├── core/                 # Shared types, schemas, validation
│   ├── server/               # Fastify backend
│   ├── database/             # Prisma schema and migrations
│   ├── ui/                   # Shared UI component library
│   ├── renderer/             # Form rendering engine (WIP)
│   ├── builder/              # Builder components (WIP)
│   └── config/               # ESLint, Prettier configs
├── docker/                   # Docker configuration
└── deploy/                   # Deployment scripts
```

### 5.3 API Endpoints

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Auth | POST | `/api/auth/login` | User authentication |
| Auth | POST | `/api/auth/register` | User registration |
| Auth | GET | `/api/auth/me` | Get current user |
| Forms | GET | `/api/forms` | List all forms |
| Forms | POST | `/api/forms` | Create new form |
| Forms | GET | `/api/forms/:id` | Get form details |
| Forms | PATCH | `/api/forms/:id` | Update form |
| Forms | DELETE | `/api/forms/:id` | Delete form |
| Submissions | GET | `/api/submissions` | List submissions |
| Themes | GET | `/api/themes` | List themes |
| Integrations | GET | `/api/integrations` | List integrations |

### 5.4 Database Schema

Core entities:
- **User** - Account holder with authentication credentials
- **Organization** - Multi-tenant container for users
- **Workspace** - Project grouping within an organization
- **Form** - The main form entity with definition JSON
- **Theme** - Styling configuration for forms
- **Submission** - User form responses
- **Integration** - Third-party service connections
- **Webhook** - HTTP callbacks for events
