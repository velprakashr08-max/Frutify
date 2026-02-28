import amqp from 'amqplib';
import 'dotenv/config';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const conn =await amqp.connect(RABBITMQ_URL);
const channel =await conn.createChannel();
console.log('\n Setting up RabbitMQ topology \n');
const DURABLE = { durable: true };
const Q_OPTS = {
  durable: true,
  arguments:{
    'x-dead-letter-exchange':'dlx',
    'x-message-ttl':86400000,
  }
};

await channel.assertExchange('dlx', 'topic',DURABLE);
await channel.assertQueue('q.dead.letters',DURABLE);
await channel.bindQueue('q.dead.letters','dlx','#');  
console.log(' Dead Letter Exchange → q.dead.letters');
await channel.assertExchange('order.events', 'topic', DURABLE);
const ORDER_QUEUES = [
  {
    name:'q.order.email',
    pattern:'order.*', 
    desc:'Order email notifications',
  },
  {
    name:'q.order.sms',
    pattern:'order.*',
    desc:'Order SMS notifications',
  },
  {
    name:'q.order.push',
    pattern:'order.*', 
    desc:'Order browser push notifications',
  },
  {
    name:'q.order.review_request',
    pattern:'order.delivered',
    desc:'Post-delivery review request',
  },
  {
    name:'q.order.analytics',
    pattern:'order.created',
    desc:'Order analytics ingestion',
  },
];

for (const q of ORDER_QUEUES){
  await channel.assertQueue(q.name,Q_OPTS);
  await channel.bindQueue(q.name,'order.events',q.pattern);
  console.log(` order.events  [${q.pattern.padEnd(20)}] →${q.name}`);
}
await channel.assertExchange('payment.events', 'direct', DURABLE);
const PAYMENT_QUEUES = [
  {
    name:'q.payment.confirm_order',
    key:'payment.success',
    desc:'Confirm order after payment success',
  },
  {
    name:'q.payment.notify_failure',
    key:'payment.failed',
    desc:'Notify user of payment failure',
  },
  {
    name:'q.payment.process_refund',
    key:'payment.refunded',
    desc:'Process refund notification',
  },
];

for (const q of PAYMENT_QUEUES){
  await channel.assertQueue(q.name,Q_OPTS);
  await channel.bindQueue(q.name,'payment.events',q.key);
  console.log(`payment.events [${q.key.padEnd(20)}] → ${q.name}`);
}

await channel.assertExchange('catalog.events', 'direct', DURABLE);
const CATALOG_QUEUES = [
  {
    name:'q.catalog.es_sync',
    key:'product.updated',
    desc:'Elasticsearch re-index worker',
  },
  {
    name:'q.catalog.es_delete',
    key:'product.deleted',
    desc:'Elasticsearch delete worker',
  },
  {
    name:'q.catalog.rating_aggregator',
    key:'review.created',
    desc:'Review aggregation worker (updates MongoDB product.avg_rating)',
  },
];

for (const q of CATALOG_QUEUES){
  await channel.assertQueue(q.name,Q_OPTS);
  await channel.bindQueue(q.name,'catalog.events',q.key);
  console.log(`catalog.events [${q.key.padEnd(20)}] → ${q.name}`);
}

console.log('\n All queues created');
const allQueues =[
  'q.dead.letters',
  ...ORDER_QUEUES.map(q=>q.name),
  ...PAYMENT_QUEUES.map(q=>q.name),
  ...CATALOG_QUEUES.map(q=>q.name),
];
allQueues.forEach(q=>console.log(`${q}`));
console.log('\n RabbitMQ topology ready.\n');
console.log('Management UI → http://localhost:15672');
console.log('Default login  → guest / guest\n');
await channel.close();
await conn.close();
