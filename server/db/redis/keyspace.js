// ============================================================
//  Frutify — Redis Keyspace Reference & Setup Script
//  Run: node server/db/redis/keyspace.js
//
//  Redis has no "tables" — it uses key naming conventions.
//  This file documents every key pattern and verifies the
//  connection is working.
// ============================================================

import Redis from 'ioredis';
import 'dotenv/config';

// ── Logical DB assignment ─────────────────────────────────────
//  Redis supports DB 0–15 (select with SELECT n or db option)
//  Keeping concerns separated prevents key collisions.
//
//  DB 0 — OTP codes
//  DB 1 — Sessions & refresh tokens
//  DB 2 — Rate limiting counters
//  DB 3 — Idempotency / processed-message dedup
//  DB 4 — Cart (fast ephemeral store, optional — see MongoDB carts)
//  DB 5 — Product cache (cache-aside for hot products)
// ─────────────────────────────────────────────────────────────

const BASE = { host: '127.0.0.1', port: 6379 };

export const otpDB         = new Redis({ ...BASE, db: 0 });
export const sessionDB     = new Redis({ ...BASE, db: 1 });
export const rateLimitDB   = new Redis({ ...BASE, db: 2 });
export const idempotencyDB = new Redis({ ...BASE, db: 3 });
export const cartDB        = new Redis({ ...BASE, db: 4 });
export const cacheDB       = new Redis({ ...BASE, db: 5 });


// ============================================================
//  KEY PATTERNS  (document + test each one)
// ============================================================

// ── DB 0: OTP ─────────────────────────────────────────────────
//
//  otp:{phone}              → "123456"           TTL: 300s  (5 min)
//  otp_attempts:{phone}     → "3"               TTL: 3600s (1 hr)
//
//  SET otp:9876543210 "482910" EX 300
//  INCR otp_attempts:9876543210  (with EXPIRE 3600 if key is new)

async function testOTP() {
  await otpDB.set('otp:_test_', '000000', 'EX', 300);
  const val = await otpDB.get('otp:_test_');
  const ttl = await otpDB.ttl('otp:_test_');
  await otpDB.del('otp:_test_');
  console.log(`✔  DB 0 OTP       — GET=${val}  TTL=${ttl}s`);
}


// ── DB 1: Sessions / Refresh Tokens ───────────────────────────
//
//  refresh:{userId}         → "{jwtRefreshToken}"   TTL: 604800s (7 days)
//  blacklist:{jti}          → "1"                   TTL: until token expiry
//
//  SET refresh:uuid-user "eyJ..." EX 604800
//  SET blacklist:jti-uuid "1" EX <seconds_until_expiry>

async function testSession() {
  await sessionDB.set('refresh:_test_user_', 'fake.jwt.token', 'EX', 604800);
  const val = await sessionDB.get('refresh:_test_user_');
  const ttl = await sessionDB.ttl('refresh:_test_user_');
  await sessionDB.del('refresh:_test_user_');
  console.log(`✔  DB 1 Sessions  — GET=${val?.slice(0,15)}...  TTL=${ttl}s`);
}


// ── DB 2: Rate Limiting ────────────────────────────────────────
//
//  rate:otp:{phone}         → "3"   TTL: 3600s  (max 5 OTPs/hr)
//  rate:api:{ip}            → "47"  TTL: 60s    (max 100 req/min)
//
//  INCR rate:otp:9876543210
//  EXPIRE rate:otp:9876543210 3600  (only on first INCR)

async function testRateLimit() {
  const key = 'rate:api:_test_ip_';
  await rateLimitDB.incr(key);
  await rateLimitDB.expire(key, 60);
  const val = await rateLimitDB.get(key);
  const ttl = await rateLimitDB.ttl(key);
  await rateLimitDB.del(key);
  console.log(`✔  DB 2 RateLimit — count=${val}  TTL=${ttl}s`);
}


// ── DB 3: Idempotency / Message Dedup ─────────────────────────
//
//  processed:{messageId}    → "1"   TTL: 86400s (24 hr)
//
//  Used by RabbitMQ workers: if key exists, message was already
//  processed — skip to prevent duplicate emails/SMS/payments.
//
//  SETNX processed:msg-uuid "1"
//  EXPIRE processed:msg-uuid 86400

async function testIdempotency() {
  const key = 'processed:_test_msg_uuid_';
  const set = await idempotencyDB.setnx(key, '1');
  await idempotencyDB.expire(key, 86400);
  const ttl = await idempotencyDB.ttl(key);
  await idempotencyDB.del(key);
  console.log(`✔  DB 3 Idempotency — SETNX=${set}  TTL=${ttl}s`);
}


// ── DB 4: Cart (ephemeral) ─────────────────────────────────────
//
//  cart:{userId}            → JSON string of cart items   TTL: 86400s
//
//  SET cart:uuid-user "{\"items\":[...]}" EX 86400

async function testCart() {
  const key = 'cart:_test_user_';
  const payload = JSON.stringify({ items: [{ productId: 'abc', qty: 2 }] });
  await cartDB.set(key, payload, 'EX', 86400);
  const val = await cartDB.get(key);
  const ttl = await cartDB.ttl(key);
  await cartDB.del(key);
  console.log(`✔  DB 4 Cart      — items=${JSON.parse(val).items.length}  TTL=${ttl}s`);
}


// ── DB 5: Product Cache ────────────────────────────────────────
//
//  product:{slug}           → JSON product doc    TTL: 900s (15 min)
//  products:list:{page}     → JSON array          TTL: 300s (5 min)
//
//  Cache-aside pattern:
//    1. Check cache → hit → return
//    2. Miss → query MongoDB → store in cache → return

async function testCache() {
  const key = 'product:organic-carrot';
  const doc = JSON.stringify({ slug: 'organic-carrot', price: 49 });
  await cacheDB.set(key, doc, 'EX', 900);
  const val = await cacheDB.get(key);
  const ttl = await cacheDB.ttl(key);
  await cacheDB.del(key);
  console.log(`✔  DB 5 Cache     — slug=${JSON.parse(val).slug}  TTL=${ttl}s`);
}


// ── Run all tests ─────────────────────────────────────────────
console.log('\n── Testing Redis DBs ────────────────────');
await testOTP();
await testSession();
await testRateLimit();
await testIdempotency();
await testCart();
await testCache();
console.log('─────────────────────────────────────────');
console.log('🎉  Redis keyspace verified.\n');

otpDB.disconnect();
sessionDB.disconnect();
rateLimitDB.disconnect();
idempotencyDB.disconnect();
cartDB.disconnect();
cacheDB.disconnect();
