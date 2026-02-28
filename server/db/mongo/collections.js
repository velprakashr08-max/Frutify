import mongoose from 'mongoose';
import 'dotenv/config';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/frutify';
await mongoose.connect(MONGO_URI);
const db = mongoose.connection.db;
console.log('Connected to MongoDB:',db.databaseName);
async function createCollection(name,options ={}){
  const existing = await db.listCollections({name}).toArray();
  if (existing.length === 0){
    await db.createCollection(name, options);
    console.log(`Created collection:${name}`);
  } else {
    console.log(`Already exists:${name}`);
  }
}
await createCollection('products',{
  validator:{
    $jsonSchema:{
      bsonType: 'object',
      required: ['name','slug','price','stock','type','category'],
      properties:{
        name:{bsonType:'string',description:'Product display name'},
        slug:{bsonType:'string',description:'URL-safe unique identifier'},
        category:{bsonType:'string'},
        type:{bsonType:'string',enum:['fruit','vegetable']},
        price:{bsonType:'number',minimum:0},
        original_price:{bsonType:'number',minimum:0},
        discount:{bsonType:'number',minimum:0,maximum:100},
        stock:{bsonType:'int',minimum:0},
        unit:{bsonType:'string'},
        organic:{bsonType:'bool'},
        images:{bsonType:'array'},  //i will store cloudinary urls here if any one uses my code  i am informing you and then i am storing images in cloudinary 
        tags:{bsonType:'array'},
        nutrition:{bsonType:'object',
          properties:{
            calories:{bsonType:'number'},
            carbs:{bsonType:'string'},
            protein:{bsonType:'string'},
            fat:{bsonType:'string'},
            fiber:{bsonType:'string'},
          }
        },
        // denormalized aggregates
        avg_rating:{bsonType:'double',minimum:0,maximum:5},
        review_count:{bsonType:'int',minimum:0},
        deleted_at:{bsonType:['date','null']}, 
      }
    }
  },
  validationAction: 'warn',
});
const products=db.collection('products');
await products.createIndex({slug:1},{unique:true,name:'idx_slug'});
await products.createIndex({category:1},{name:'idx_category'});
await products.createIndex({type:1,organic:1},{name:'idx_type_organic'});
await products.createIndex({avg_rating:-1},{name:'idx_rating_desc'});
await products.createIndex({price:1},{name:'idx_price_asc'});
await products.createIndex({stock:1},{name:'idx_stock'});
await products.createIndex({deleted_at:1},{name:'idx_soft_delete'});
await products.createIndex({tags:1},{name:'idx_tags'});
await products.createIndex(
{name:'text', tags:'text',category:'text'},
{name:'idx_text_search',weights:{name:10,tags:5,category:3}}
);
console.log('Products indexes created');

await createCollection('reviews',{
  validator:{
    $jsonSchema:{
      bsonType:'object',
      required:['product_id','user_id','rating'],
      properties:{
        product_id:{bsonType:'objectId'},
        user_id:{bsonType:'string'},  
        user_name:{bsonType:'string'}, 
        user_avatar:{bsonType:'string'},   
        rating:{
          bsonType:'int',
          minimum:1,
          maximum:5,
        },
        title:{bsonType:'string'},
        body:{bsonType:'string'},
        images:{bsonType:'array'},
        helpful_votes:{bsonType:'int',minimum:0},
        is_verified_purchase:{bsonType:'bool'},
      }
    }
  },
  validationAction:'warn',
});
const reviews=db.collection('reviews');
await reviews.createIndex({product_id:1},{name:'idx_product'});
await reviews.createIndex({user_id:1},{name:'idx_user'});
await reviews.createIndex({product_id:1,user_id:1},{unique:true,name:'idx_one_review_per_user'});
await reviews.createIndex({created_at:-1},{name:'idx_latest'});
await reviews.createIndex({rating:-1},{name:'idx_rating'});
console.log('Reviews indexes created');

await createCollection('carts',{
  validator:{
    $jsonSchema:{
      bsonType:'object',
      required:['user_id','items'],
      properties:{
      user_id:{bsonType:'string'},
        items:{
          bsonType:'array',
          items:{
            bsonType:'object',
            required:['product_id','quantity'],
            properties:{
              product_id:{bsonType:'objectId'},
              name:{bsonType:'string'}, 
              image:{bsonType:'string'},
              price:{bsonType:'number'},
              quantity:{bsonType:'int',minimum:1},
              unit:{bsonType:'string'},
            }
          }
        },
        updated_at:{bsonType:'date'},
      }
    }
  }
});
const carts=db.collection('carts');
await carts.createIndex({user_id:1},{unique:true,name:'idx_cart_user'});
await carts.createIndex({updated_at:1},{expireAfterSeconds: 2592000,name:'idx_cart_ttl'});
console.log('Carts indexes created');
await createCollection('wishlists');
const wishlists=db.collection('wishlists');
await wishlists.createIndex({user_id:1},{unique:true,name:'idx_wishlist_user'});
await wishlists.createIndex({'items.product_id':1},{name:'idx_wishlist_product'});
console.log('Wishlists indexes created');
await createCollection('push_subscriptions');
const pushSubs=db.collection('push_subscriptions');
await pushSubs.createIndex({user_id:1},{name:'idx_push_user'});
await pushSubs.createIndex({endpoint:1},{unique:true,name:'idx_push_endpoint'});
console.log('Push subscriptions indexes created');
console.log('MongoDB setup complete');
await mongoose.disconnect();
