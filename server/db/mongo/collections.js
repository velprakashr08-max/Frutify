// ============================================================
//  Frutify — MongoDB Collection Setup
//  Run: node server/db/mongo/collections.js
//  (or paste each block into mongosh)
// ============================================================

import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frutify';

await mongoose.connect(MONGO_URI);
const db = mongoose.connection.db;
console.log('Connected to MongoDB:', db.databaseName);

// ── Helper ────────────────────────────────────────────────────
async function createCollection(name, options = {}) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await db.createCollection(name, options);
    console.log(`✔  Created collection: ${name}`);
  } else {
    console.log(`–  Already exists:    ${name}`);
  }
}


// ============================================================
//  1. PRODUCTS
//     Denormalized for fast reads:
//     avg_rating + review_count stored here, updated by worker
// ============================================================
await createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'slug', 'price', 'stock', 'type', 'category'],
      properties: {
        name:           { bsonType: 'string',  description: 'Product display name' },
        slug:           { bsonType: 'string',  description: 'URL-safe unique identifier' },
        category:       { bsonType: 'string' },
        type:           { bsonType: 'string',  enum: ['fruit', 'vegetable'] },
        price:          { bsonType: 'number',  minimum: 0 },
        original_price: { bsonType: 'number',  minimum: 0 },
        discount:       { bsonType: 'number',  minimum: 0, maximum: 100 },
        stock:          { bsonType: 'int',     minimum: 0 },
        unit:           { bsonType: 'string' },
        organic:        { bsonType: 'bool' },
        images:         { bsonType: 'array' },        // Cloudinary URLs
        tags:           { bsonType: 'array' },
        nutrition: {
          bsonType: 'object',
          properties: {
            calories: { bsonType: 'number' },
            carbs:    { bsonType: 'string' },
            protein:  { bsonType: 'string' },
            fat:      { bsonType: 'string' },
            fiber:    { bsonType: 'string' },
          }
        },
        // Denormalized aggregates — recalculated by review-aggregation worker
        avg_rating:     { bsonType: 'double', minimum: 0, maximum: 5 },
        review_count:   { bsonType: 'int',    minimum: 0 },
        deleted_at:     { bsonType: ['date', 'null'] },  // soft delete
      }
    }
  },
  validationAction: 'warn',  // warn, not error, so updates don't break on partial docs
});

// Products indexes
const products = db.collection('products');
await products.createIndex({ slug: 1 },            { unique: true, name: 'idx_slug' });
await products.createIndex({ category: 1 },                        { name: 'idx_category' });
await products.createIndex({ type: 1, organic: 1 },                { name: 'idx_type_organic' });
await products.createIndex({ avg_rating: -1 },                     { name: 'idx_rating_desc' });
await products.createIndex({ price: 1 },                           { name: 'idx_price_asc' });
await products.createIndex({ stock: 1 },                           { name: 'idx_stock' });
await products.createIndex({ deleted_at: 1 },                      { name: 'idx_soft_delete' });
await products.createIndex({ tags: 1 },                            { name: 'idx_tags' });
// Text index for basic search (Elasticsearch handles production search)
await products.createIndex(
  { name: 'text', tags: 'text', category: 'text' },
  { name: 'idx_text_search', weights: { name: 10, tags: 5, category: 3 } }
);
console.log('✔  Products indexes created');


// ============================================================
//  2. REVIEWS
//     user_name is DENORMALIZED here (snapshot at write time)
//     so reviews don't break if user changes their name
// ============================================================
await createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['product_id', 'user_id', 'rating'],
      properties: {
        product_id:    { bsonType: 'objectId' },
        user_id:       { bsonType: 'string' },   // PostgreSQL UUID
        user_name:     { bsonType: 'string' },   // denormalized snapshot
        user_avatar:   { bsonType: 'string' },   // denormalized snapshot
        rating: {
          bsonType: 'int',
          minimum: 1,
          maximum: 5,
        },
        title:         { bsonType: 'string' },
        body:          { bsonType: 'string' },
        images:        { bsonType: 'array' },    // Cloudinary URLs
        helpful_votes: { bsonType: 'int', minimum: 0 },
        is_verified_purchase: { bsonType: 'bool' },  // cross-check with PG orders
      }
    }
  },
  validationAction: 'warn',
});

const reviews = db.collection('reviews');
await reviews.createIndex({ product_id: 1 },                          { name: 'idx_product' });
await reviews.createIndex({ user_id: 1 },                             { name: 'idx_user' });
await reviews.createIndex({ product_id: 1, user_id: 1 }, { unique: true, name: 'idx_one_review_per_user' });
await reviews.createIndex({ created_at: -1 },                         { name: 'idx_latest' });
await reviews.createIndex({ rating: -1 },                             { name: 'idx_rating' });
console.log('✔  Reviews indexes created');


// ============================================================
//  3. CARTS
//     Persistent cart per user stored in MongoDB
//     (alternative: Redis — use this for longer-lived carts)
// ============================================================
await createCollection('carts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'items'],
      properties: {
        user_id: { bsonType: 'string' },   // PostgreSQL UUID
        items: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['product_id', 'quantity'],
            properties: {
              product_id: { bsonType: 'objectId' },
              name:       { bsonType: 'string' },   // denormalized snapshot
              image:      { bsonType: 'string' },
              price:      { bsonType: 'number' },
              quantity:   { bsonType: 'int', minimum: 1 },
              unit:       { bsonType: 'string' },
            }
          }
        },
        updated_at: { bsonType: 'date' },
      }
    }
  }
});

const carts = db.collection('carts');
await carts.createIndex({ user_id: 1 }, { unique: true, name: 'idx_cart_user' });
// TTL index: auto-delete abandoned carts after 30 days
await carts.createIndex({ updated_at: 1 }, { expireAfterSeconds: 2592000, name: 'idx_cart_ttl' });
console.log('✔  Carts indexes created');


// ============================================================
//  4. WISHLISTS
// ============================================================
await createCollection('wishlists');

const wishlists = db.collection('wishlists');
await wishlists.createIndex({ user_id: 1 }, { unique: true, name: 'idx_wishlist_user' });
await wishlists.createIndex({ 'items.product_id': 1 },               { name: 'idx_wishlist_product' });
console.log('✔  Wishlists indexes created');


// ============================================================
//  5. PUSH_SUBSCRIPTIONS
//     Web Push VAPID subscription objects per user device
// ============================================================
await createCollection('push_subscriptions');

const pushSubs = db.collection('push_subscriptions');
await pushSubs.createIndex({ user_id: 1 },   { name: 'idx_push_user' });
await pushSubs.createIndex({ endpoint: 1 }, { unique: true, name: 'idx_push_endpoint' });
console.log('✔  Push subscriptions indexes created');


console.log('\n🎉  MongoDB setup complete — all collections and indexes ready.\n');
await mongoose.disconnect();
