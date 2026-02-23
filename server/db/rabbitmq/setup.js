// ============================================================
//  Frutify — RabbitMQ Exchanges, Queues & Bindings Setup
//  Run: node server/db/rabbitmq/setup.js
//
//  This script declares all exchanges, queues, and bindings.
//  Safe to run multiple times (assertQueue/assertExchange are idempotent).
// ============================================================

import amqp from 'amqplib';
import 'dotenv/config';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

const conn    = await amqp.connect(RABBITMQ_URL);
const channel = await conn.createChannel();

console.log('\n── Setting up RabbitMQ topology ──────────────\n');


// ── Exchange options ──────────────────────────────────────────
//  durable: true  → exchange survives broker restart
//  autoDelete: false → don't delete when last consumer disconnects

const DURABLE = { durable: true };

// ── Queue options ─────────────────────────────────────────────
//  durable: true         → queue survives broker restart
//  deadLetterExchange    → failed messages go here after maxRetry
//  messageTtl            → auto-expire unprocessed messages (ms)
//  maxLength             → max messages before head is dropped

const Q_OPTS = {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx',   // dead-letter exchange
    'x-message-ttl':          86400000, // 24 hr — drop if unprocessed
  }
};


// ============================================================
//  Dead Letter Exchange (DLX)
//  Messages that fail after retries land here for inspection.
// ============================================================
await channel.assertExchange('dlx', 'topic', DURABLE);
await channel.assertQueue('q.dead.letters', DURABLE);
await channel.bindQueue('q.dead.letters', 'dlx', '#');  // catch-all
console.log('✔  Dead Letter Exchange → q.dead.letters');


// ============================================================
//  Exchange 1: order.events  (type: topic)
//  Routing keys: order.created | order.confirmed | order.shipped
//                order.delivered | order.cancelled | order.refunded
// ============================================================
await channel.assertExchange('order.events', 'topic', DURABLE);

const ORDER_QUEUES = [
  {
    name:    'q.order.email',
    pattern: 'order.*',        // ALL order events → email worker
    desc:    'Order email notifications',
  },
  {
    name:    'q.order.sms',
    pattern: 'order.*',        // ALL order events → SMS worker
    desc:    'Order SMS notifications',
  },
  {
    name:    'q.order.push',
    pattern: 'order.*',        // ALL order events → Web Push worker
    desc:    'Order browser push notifications',
  },
  {
    name:    'q.order.review_request',
    pattern: 'order.delivered', // Only on delivery → ask for review
    desc:    'Post-delivery review request',
  },
  {
    name:    'q.order.analytics',
    pattern: 'order.created',   // Track new orders in analytics
    desc:    'Order analytics ingestion',
  },
];

for (const q of ORDER_QUEUES) {
  await channel.assertQueue(q.name, Q_OPTS);
  await channel.bindQueue(q.name, 'order.events', q.pattern);
  console.log(`✔  order.events  [${q.pattern.padEnd(20)}] → ${q.name}`);
}


// ============================================================
//  Exchange 2: payment.events  (type: direct)
//  Routing keys: payment.success | payment.failed | payment.refunded
// ============================================================
await channel.assertExchange('payment.events', 'direct', DURABLE);

const PAYMENT_QUEUES = [
  {
    name:    'q.payment.confirm_order',
    key:     'payment.success',   // On success → confirm the order in PG
    desc:    'Confirm order after payment success',
  },
  {
    name:    'q.payment.notify_failure',
    key:     'payment.failed',    // On failure → notify customer
    desc:    'Notify user of payment failure',
  },
  {
    name:    'q.payment.process_refund',
    key:     'payment.refunded',  // On refund → update records + notify
    desc:    'Process refund notification',
  },
];

for (const q of PAYMENT_QUEUES) {
  await channel.assertQueue(q.name, Q_OPTS);
  await channel.bindQueue(q.name, 'payment.events', q.key);
  console.log(`✔  payment.events [${q.key.padEnd(20)}] → ${q.name}`);
}


// ============================================================
//  Exchange 3: catalog.events  (type: direct)
//  Routing keys: product.created | product.updated | product.deleted
// ============================================================
await channel.assertExchange('catalog.events', 'direct', DURABLE);

const CATALOG_QUEUES = [
  {
    name: 'q.catalog.es_sync',
    key:  'product.updated',       // Sync to Elasticsearch on every change
    desc: 'Elasticsearch re-index worker',
  },
  {
    name: 'q.catalog.es_delete',
    key:  'product.deleted',       // Remove from ES index on soft-delete
    desc: 'Elasticsearch delete worker',
  },
  {
    name: 'q.catalog.rating_aggregator',
    key:  'review.created',        // Recalculate avg_rating on new review
    desc: 'Review aggregation worker (updates MongoDB product.avg_rating)',
  },
];

for (const q of CATALOG_QUEUES) {
  await channel.assertQueue(q.name, Q_OPTS);
  await channel.bindQueue(q.name, 'catalog.events', q.key);
  console.log(`✔  catalog.events [${q.key.padEnd(20)}] → ${q.name}`);
}


// ============================================================
//  Verify — list all queues
// ============================================================
console.log('\n── All queues created ────────────────────────');
const allQueues = [
  'q.dead.letters',
  ...ORDER_QUEUES.map(q => q.name),
  ...PAYMENT_QUEUES.map(q => q.name),
  ...CATALOG_QUEUES.map(q => q.name),
];
allQueues.forEach(q => console.log(`   ${q}`));


console.log('\n🎉  RabbitMQ topology ready.\n');
console.log('   Management UI → http://localhost:15672');
console.log('   Default login  → guest / guest\n');

await channel.close();
await conn.close();
