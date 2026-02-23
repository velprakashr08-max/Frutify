# Frutify — Architecture & Structure

## Is This Microservices or Monolithic?

### Answer: Modular Monolith

This is **not** a traditional monolith and **not** full microservices.
It is a **Modular Monolith** — a single deployable Node.js server, internally divided into strict modules.

---

### Comparison

| | Simple Monolith | **Modular Monolith (Frutify)** | Microservices |
|---|---|---|---|
| Deployment units | 1 | **1** | Many (1 per service) |
| Codebase | All mixed | **Separated by domain** | Separate repos |
| Database | 1 shared DB | **Multiple DBs, each owned by a module** | Each service owns its DB |
| Communication | Function calls | **Function calls + async queue** | HTTP / gRPC / queue |
| Complexity | Low | **Medium** | High |
| Good for | Small projects | **Growing projects / solo teams** | Large teams |
| Scaling | Scale whole app | **Scale whole app** | Scale per service |

---

### What This Means for Frutify

```
One Express.js process runs everything:
  ├── /auth        module  → uses PostgreSQL + Redis
  ├── /products    module  → uses MongoDB + Elasticsearch + Redis cache
  ├── /orders      module  → uses PostgreSQL (ACID)
  ├── /payments    module  → uses PostgreSQL + Stripe
  ├── /reviews     module  → uses MongoDB
  ├── /search      module  → uses Elasticsearch
  └── /upload      module  → uses Cloudinary

Async side-effects are decoupled via RabbitMQ:
  → email-worker  (could be extracted to a microservice later)
  → sms-worker
  → push-worker
  → es-sync-worker
  → rating-aggregator-worker
```

Workers run in the **same process** for now, but each is a self-contained
module that can be split into a separate service with zero logic changes.

---

## Architectural Pattern: Domain-Driven Layered Architecture

```
┌─────────────────────────────────────┐
│           Client (React)            │
└──────────────┬──────────────────────┘
               │  HTTP / REST
┌──────────────▼──────────────────────┐
│           Routes  (/api/v1/*)       │  ← Entry points
├─────────────────────────────────────┤
│         Middleware Layer            │  ← Auth, rate-limit, validation
├─────────────────────────────────────┤
│         Controllers                 │  ← Request/response handling only
├─────────────────────────────────────┤
│           Services                  │  ← ALL business logic lives here
├──────────┬──────────────────────────┤
│  Models  │  External Integrations   │  ← DB queries, Stripe, Cloudinary
│ (PG/Mongo│  (Stripe/Cloudinary/SMS) │
└──────────┴──────────────────────────┘
               │  Events
┌──────────────▼──────────────────────┐
│        RabbitMQ (async queue)       │
├─────────────────────────────────────┤
│  Workers: email │ sms │ push │ es   │
└─────────────────────────────────────┘
```

### Each Layer's Responsibility

| Layer | Responsibility | Example |
|---|---|---|
| **Route** | Map URL + method to controller | `POST /api/v1/orders → OrderController.create` |
| **Middleware** | Cross-cutting concerns | JWT verify, rate-limit, Multer upload |
| **Controller** | Parse req, call service, send res | Extract body → call `OrderService.create()` → `res.json()` |
| **Service** | Business logic | Validate stock, apply coupon, create order + items in one transaction |
| **Model/Repository** | Database queries | `pool.query(INSERT INTO orders...)` / `Order.findById()` |
| **Worker** | Async side effects | Consume RabbitMQ message → send email via Nodemailer |

**Rule:** Controllers never talk to the database directly. Services never touch `req`/`res`.

---

## Data Ownership Per Module

| Module | Owns in PostgreSQL | Owns in MongoDB | Uses Redis | Uses ES |
|---|---|---|---|---|
| auth | users, otp_logs, token_blacklist | — | OTP, sessions, rate-limit | — |
| address | addresses | — | — | — |
| product | — | products | cache | index |
| review | — | reviews | — | — |
| cart | — | carts | ephemeral cart | — |
| wishlist | — | wishlists | — | — |
| order | orders, order_items | — | idempotency key | — |
| payment | payments | — | — | — |
| coupon | coupons | — | — | — |
| search | — | — | — | query |
| notification | — | push_subscriptions | — | — |

---

## Why Not Full Microservices?

Microservices add significant overhead:
- Service discovery (Consul / Kubernetes)
- Inter-service HTTP or gRPC calls
- Distributed tracing (Jaeger / Zipkin)
- Multiple deployments and CI pipelines

For a project at this stage, the cost outweighs the benefit.

The Modular Monolith approach means:
1. Simple to run locally (`node src/index.js`)
2. No network latency between modules
3. Easy to debug (single process, single log stream)
4. **Can be extracted into microservices** anytime — each module is already isolated

---

## Migration Path to Microservices (if needed later)

```
Step 1 — Current: Modular Monolith
  All modules in one Express app
  Workers in same process

Step 2 — Extract Workers First (low risk)
  email-service   → separate Node process
  sms-service     → separate Node process
  es-sync-service → separate Node process
  (They already communicate only via RabbitMQ — no code change needed)

Step 3 — Extract Read-heavy services
  search-service (Elasticsearch queries) → separate service
  product-catalog-service (MongoDB reads) → separate service

Step 4 — Extract Write-heavy services
  order-service (PostgreSQL) → separate service
  payment-service → separate service

Step 5 — Add API Gateway
  nginx / Kong / AWS API Gateway
  Routes /products/* → product-service
  Routes /orders/*   → order-service
  etc.
```

---

## Summary

| Question | Answer |
|---|---|
| Architecture | Modular Monolith |
| Pattern | Domain-Driven Layered (Routes → Controller → Service → Model) |
| Async | Event-driven via RabbitMQ (order, payment, catalog events) |
| Databases | PostgreSQL for transactional data, MongoDB for flexible catalog, Redis for ephemeral, ES for search |
| Can become microservices? | Yes — each module is already isolated |
