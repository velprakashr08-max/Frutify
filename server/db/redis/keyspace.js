import Redis from 'ioredis';
import 'dotenv/config';
const BASE ={host:'127.0.0.1',port:6379};
export const otpDB=new Redis({...BASE,db:0});
export const sessionDB=new Redis({...BASE,db:1});
export const rateLimitDB=new Redis({...BASE,db:2});
export const idempotencyDB=new Redis({...BASE,db:3});
export const cartDB=new Redis({ ...BASE,db:4});
export const cacheDB=new Redis({...BASE,db:5});
async function testOTP() {
  await otpDB.set('otp:_test_','000000','EX',300);
  const val =await otpDB.get('otp:_test_');
  const ttl =await otpDB.ttl('otp:_test_');
  await otpDB.del('otp:_test_');
  console.log(`✔  DB 0 OTP— GET=${val}  TTL=${ttl}s`);
}
async function testSession() {
  await sessionDB.set('refresh:_test_user_', 'fake.jwt.token', 'EX', 604800);
  const val = await sessionDB.get('refresh:_test_user_');
  const ttl = await sessionDB.ttl('refresh:_test_user_');
  await sessionDB.del('refresh:_test_user_');
  console.log(`✔  DB 1 Sessions  — GET=${val?.slice(0,15)}...  TTL=${ttl}s`);
}
async function testRateLimit() {
  const key = 'rate:api:_test_ip_';
  await rateLimitDB.incr(key);
  await rateLimitDB.expire(key, 60);
  const val = await rateLimitDB.get(key);
  const ttl = await rateLimitDB.ttl(key);
  await rateLimitDB.del(key);
  console.log(`✔  DB 2 RateLimit — count=${val}  TTL=${ttl}s`);
}

async function testIdempotency() {
  const key = 'processed:_test_msg_uuid_';
  const set = await idempotencyDB.setnx(key, '1');
  await idempotencyDB.expire(key, 86400);
  const ttl = await idempotencyDB.ttl(key);
  await idempotencyDB.del(key);
  console.log(`✔  DB 3 Idempotency — SETNX=${set}  TTL=${ttl}s`);
}

async function testCart() {
  const key = 'cart:_test_user_';
  const payload = JSON.stringify({ items: [{ productId: 'abc', qty: 2 }] });
  await cartDB.set(key, payload, 'EX', 86400);
  const val = await cartDB.get(key);
  const ttl = await cartDB.ttl(key);
  await cartDB.del(key);
  console.log(`✔  DB 4 Cart      — items=${JSON.parse(val).items.length}  TTL=${ttl}s`);
}
async function testCache() {
  const key = 'product:organic-carrot';
  const doc = JSON.stringify({ slug: 'organic-carrot', price: 49 });
  await cacheDB.set(key, doc, 'EX', 900);
  const val = await cacheDB.get(key);
  const ttl = await cacheDB.ttl(key);
  await cacheDB.del(key);
  console.log(`✔  DB 5 Cache     — slug=${JSON.parse(val).slug}  TTL=${ttl}s`);
}
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
