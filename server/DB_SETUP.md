# Frutify — Database Setup Guide

> Step-by-step instructions to create and configure every database used in this project.

---

## Databases Covered

1. [PostgreSQL](#1-postgresql)
2. [MongoDB](#2-mongodb)
3. [Redis](#3-redis)
4. [Elasticsearch](#4-elasticsearch)
5. [RabbitMQ](#5-rabbitmq)
6. [Verify All Connections](#6-verify-all-connections)

---

## 1. PostgreSQL

### Install

```bash
# Windows — download installer
https://www.postgresql.org/download/windows/
# Default port: 5432  |  Default superuser: postgres
```

### Create Database & User

Open **pgAdmin** or **psql** (SQL Shell):

```sql
-- 1. Connect as superuser
-- (psql opens as postgres by default)

-- 2. Create a dedicated user
CREATE USER frutify_user WITH PASSWORD 'yourpassword';

-- 3. Create the database
CREATE DATABASE frutify OWNER frutify_user;

-- 4. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE frutify TO frutify_user;

-- 5. Connect to the new database
\c frutify
```

### Run Schema Migrations

Save the block below as `server/src/models/pg/migrations/001_init.sql` and run it:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100),
  email       VARCHAR(150) UNIQUE,
  phone       VARCHAR(15)  UNIQUE NOT NULL,
  role        VARCHAR(20)  DEFAULT 'customer',
  avatar_url  TEXT,
  is_verified BOOLEAN      DEFAULT false,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  label      VARCHAR(50),
  line1      TEXT NOT NULL,
  line2      TEXT,
  city       VARCHAR(100),
  state      VARCHAR(100),
  pincode    VARCHAR(10),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  address_id      UUID REFERENCES addresses(id),
  status          VARCHAR(30) DEFAULT 'pending',
  total_amount    NUMERIC(10,2),
  discount_amount NUMERIC(10,2) DEFAULT 0,
  stripe_pi_id    TEXT UNIQUE,
  idempotency_key TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  image_url  TEXT,
  price      NUMERIC(10,2),
  quantity   INT,
  unit       VARCHAR(20)
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID REFERENCES orders(id),
  stripe_pi_id   TEXT UNIQUE,
  amount         NUMERIC(10,2),
  currency       VARCHAR(5) DEFAULT 'inr',
  status         VARCHAR(30),
  stripe_receipt TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(30) UNIQUE,
  discount_type VARCHAR(10),
  value         NUMERIC(6,2),
  min_order     NUMERIC(10,2) DEFAULT 0,
  max_uses      INT DEFAULT 100,
  used_count    INT DEFAULT 0,
  expires_at    TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id  ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_addresses_user  ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_items_order_id  ON order_items(order_id);
```

Run via psql:

```bash
psql -U frutify_user -d frutify -f server/src/models/pg/migrations/001_init.sql
```

### .env values

```env
PG_HOST=localhost
PG_PORT=5432
PG_DB=frutify
PG_USER=frutify_user
PG_PASSWORD=yourpassword
```

### Node.js connection

```bash
npm install pg
```

```js
// server/src/config/postgres.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     process.env.PG_PORT,
  database: process.env.PG_DB,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('PG connection error', err));
```

---

## 2. MongoDB

### Install

```bash
# Windows — download MSI installer (Community Edition)
https://www.mongodb.com/try/download/community
# Default port: 27017
# Also install MongoDB Compass (GUI) — bundled with installer
```

### Create Database & Collections

MongoDB creates databases and collections **lazily** (on first write). To set them up explicitly — open **MongoDB Compass** or **mongosh**:

```js
// In mongosh terminal
use frutify  // switches to (creates) the database

// Create collections explicitly with validation
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "price", "stock"],
      properties: {
        name:  { bsonType: "string" },
        slug:  { bsonType: "string" },
        price: { bsonType: "number", minimum: 0 },
        stock: { bsonType: "int",    minimum: 0 },
      }
    }
  }
});

db.createCollection("reviews");

// Create indexes
db.products.createIndex({ slug: 1 },     { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ avg_rating: -1 });
db.products.createIndex({ type: 1, organic: 1 });

db.reviews.createIndex({ product_id: 1 });
db.reviews.createIndex({ user_id: 1 });
db.reviews.createIndex({ created_at: -1 });

// Verify
show collections
db.products.getIndexes()
```

### .env value

```env
MONGO_URI=mongodb://127.0.0.1:27017/frutify
```

### Node.js connection

```bash
npm install mongoose
```

```js
// server/src/config/mongo.js
import mongoose from 'mongoose';

export const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};
```

---

## 3. Redis

### Install

```bash
# Windows — Redis does not have a native Windows build for recent versions.
# Best options:

# Option A: WSL2 (recommended)
wsl --install              # enable WSL2
# Inside WSL terminal:
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping             # should return PONG

# Option B: Docker (easiest)
docker run -d --name frutify-redis -p 6379:6379 redis:7-alpine

# Option C: Memurai (Windows native Redis-compatible)
https://www.memurai.com/get-memurai
# Default port: 6379
```

### Verify Redis is running

```bash
redis-cli ping
# → PONG

redis-cli info server | grep redis_version
```

### Create logical databases (Redis uses numbered DBs 0–15)

```bash
# Frutify namespace plan:
# DB 0 — OTP codes
# DB 1 — Sessions / refresh tokens
# DB 2 — Rate limiting counters
# DB 3 — Idempotency keys (message processed flags)
# DB 4 — Cart data

# No explicit creation needed — select by index when connecting:
redis-cli -n 0 SET test_otp "123456" EX 300
redis-cli -n 0 GET test_otp
redis-cli -n 0 TTL test_otp
```

### .env value

```env
REDIS_URL=redis://127.0.0.1:6379
```

### Node.js connection

```bash
npm install ioredis
```

```js
// server/src/config/redis.js
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL);

// Separate logical databases
export const otpClient     = new Redis({ ...redisOptions, db: 0 });
export const sessionClient = new Redis({ ...redisOptions, db: 1 });
export const rateLimitClient = new Redis({ ...redisOptions, db: 2 });
export const idempotencyClient = new Redis({ ...redisOptions, db: 3 });
export const cartClient    = new Redis({ ...redisOptions, db: 4 });

redis.on('connect', () => console.log('Redis connected'));
redis.on('error',   (e) => console.error('Redis error', e));
```

---

## 4. Elasticsearch

### Install

```bash
# Option A: Docker (strongly recommended for local dev)
docker run -d \
  --name frutify-es \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.13.0

# Option B: Windows MSI installer
https://www.elastic.co/downloads/elasticsearch
# Default port: 9200
```

### Create the Products Index

Once Elasticsearch is running, create the index using curl or Kibana Dev Tools:

```bash
# Verify ES is up
curl http://localhost:9200

# Create products index with mapping
curl -X PUT http://localhost:9200/frutify_products \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "analysis": {
        "analyzer": {
          "product_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase", "stop"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id":         { "type": "keyword" },
        "name":       { "type": "text", "analyzer": "product_analyzer" },
        "slug":       { "type": "keyword" },
        "category":   { "type": "keyword" },
        "type":       { "type": "keyword" },
        "tags":       { "type": "keyword" },
        "organic":    { "type": "boolean" },
        "price":      { "type": "float" },
        "avg_rating": { "type": "float" },
        "stock":      { "type": "integer" },
        "image":      { "type": "keyword", "index": false },
        "suggest": {
          "type": "completion"
        }
      }
    }
  }'

# Verify index was created
curl http://localhost:9200/frutify_products
```

### .env value

```env
ES_NODE=http://localhost:9200
ES_INDEX=frutify_products
```

### Node.js connection

```bash
npm install @elastic/elasticsearch
```

```js
// server/src/config/elasticsearch.js
import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({ node: process.env.ES_NODE });

esClient.ping()
  .then(() => console.log('Elasticsearch connected'))
  .catch((e) => console.error('ES connection error', e));
```

---

## 5. RabbitMQ

### Install

```bash
# RabbitMQ requires Erlang — install Erlang first:
https://www.erlang.org/downloads

# Then install RabbitMQ:
https://www.rabbitmq.com/install-windows.html
# Default port: 5672  |  Management UI port: 15672

# Option B: Docker (easier)
docker run -d \
  --name frutify-rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=frutify \
  -e RABBITMQ_DEFAULT_PASS=frutify123 \
  rabbitmq:3-management
```

### Enable Management Plugin (if not using Docker)

```bash
rabbitmq-plugins enable rabbitmq_management
# Open browser: http://localhost:15672
# Default login: guest / guest
```

### Create Exchanges, Queues & Bindings

Open **http://localhost:15672** → Management UI, or run via CLI / amqplib setup script:

```js
// server/src/config/rabbitmq.js
import amqp from 'amqplib';

export let channel;

export const connectRabbitMQ = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();

  // ── Order Events ──────────────────────────────────────────
  await channel.assertExchange('order.events', 'topic', { durable: true });

  await channel.assertQueue('q.order.email', { durable: true });
  await channel.assertQueue('q.order.sms',   { durable: true });
  await channel.assertQueue('q.order.push',  { durable: true });

  await channel.bindQueue('q.order.email', 'order.events', 'order.*');
  await channel.bindQueue('q.order.sms',   'order.events', 'order.*');
  await channel.bindQueue('q.order.push',  'order.events', 'order.*');

  // ── Catalog Events ────────────────────────────────────────
  await channel.assertExchange('catalog.events', 'direct', { durable: true });

  await channel.assertQueue('q.catalog.es-sync', { durable: true });
  await channel.bindQueue('q.catalog.es-sync', 'catalog.events', 'product.updated');

  console.log('RabbitMQ connected — exchanges & queues ready');
};
```

### .env value

```env
# Docker setup
RABBITMQ_URL=amqp://frutify:frutify123@localhost:5672

# Default local install
# RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Node.js dependency

```bash
npm install amqplib
```

---

## 6. Verify All Connections

Create `server/src/config/healthcheck.js` to test everything at startup:

```js
import { pool }      from './postgres.js';
import { connectMongo } from './mongo.js';
import { redis }     from './redis.js';
import { esClient }  from './elasticsearch.js';
import { connectRabbitMQ } from './rabbitmq.js';

export const checkAllConnections = async () => {
  console.log('\n── Checking DB connections ──────────────');

  // PostgreSQL
  try {
    await pool.query('SELECT 1');
    console.log('✔  PostgreSQL  — OK');
  } catch (e) { console.error('✘  PostgreSQL  —', e.message); }

  // MongoDB
  try {
    await connectMongo();
    console.log('✔  MongoDB     — OK');
  } catch (e) { console.error('✘  MongoDB     —', e.message); }

  // Redis
  try {
    await redis.ping();
    console.log('✔  Redis       — OK');
  } catch (e) { console.error('✘  Redis       —', e.message); }

  // Elasticsearch
  try {
    await esClient.ping();
    console.log('✔  Elasticsearch — OK');
  } catch (e) { console.error('✘  Elasticsearch —', e.message); }

  // RabbitMQ
  try {
    await connectRabbitMQ();
    console.log('✔  RabbitMQ    — OK');
  } catch (e) { console.error('✘  RabbitMQ    —', e.message); }

  console.log('─────────────────────────────────────────\n');
};
```

Call it in `server/src/index.js`:

```js
import { checkAllConnections } from './config/healthcheck.js';
await checkAllConnections();
```

---

## Quick Reference — Ports

| Service | Default Port | GUI / Tool |
|---|---|---|
| PostgreSQL | 5432 | pgAdmin |
| MongoDB | 27017 | MongoDB Compass |
| Redis | 6379 | redis-cli / RedisInsight |
| Elasticsearch | 9200 | Kibana (port 5601) |
| RabbitMQ AMQP | 5672 | Management UI (port 15672) |

---

## Docker Compose (Run Everything at Once)

Save as `docker-compose.yml` in the project root:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: frutify
      POSTGRES_USER: frutify_user
      POSTGRES_PASSWORD: yourpassword
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --save 60 1

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: frutify
      RABBITMQ_DEFAULT_PASS: frutify123
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  pg_data:
  mongo_data:
  es_data:
```

```bash
# Start all databases with one command
docker compose up -d

# Stop all
docker compose down

# Check status
docker compose ps
```
