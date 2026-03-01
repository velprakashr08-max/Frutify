const express=require('express')       
const cors=require('cors');   
const app=express()   
app.use(cors(     
     allowlist=['http://localhost:5173','https://frutify.vercel.app']
))           
  app.use(express.json())      
  const PORT=PROCESS.env.PORT || 5000;

     
//   Node js Basics
// Installing Node.js
// Running Javascript with Node.js                     
// Node.js Modules system
// Understanding module.exports and require        
// Explore the module wrapper functions
                                                             
// NPM and Package Management    
// NPM (Node Package Manager) overview
// package.json and managing
// dependencies
// Creating a package.json File
// Adding and removing dependencies
// Understanding devDependencies vs dependencies

// Core Modules and Asynchronous Programming   
// Path module
// File System module
// http module
// CallBacks & callback hell
// intro to promises
// Creating and consuming promises
// Error Handling with promises
// Understanding async functions
// using the await keyword  
// Error handling with try/catch      

// Event Driven Programming
// Understanding the EventEmmiter class 
// Creating custom events

// Express.js fundamentals
// Installing express.js
// Creating a basic Express server
// Understanding the app Object
// Basic Routing
// Route Parameters
// Route handlers and Middleware
// Understanding Middleware
// Creating custom Middleware

// Template Engines and CRUD operations
// introduction to EJS
// Settign Up with EJS
// Creating and rendering EJS templates
// Implementing CRUD operations with HTTP methods
// Introducton to Postman
// Creating and organizing Api requests
// Testing API enspoints

// Database Integration and RESTful APIs
// MOngoDB & Mongoose basics
// Building a RESTful API -book store Project
// Authentication and Authorization
// Crating user registration endpoint
// implementing user login logic

// Security and Advance Features
// introduction to bcrypt
// Hashing Passwords
// Comparing hashed passwords
// Understanding JWT structure
// Creating and siging JWts
// Verifying JWTs
// Creating middleware for jwt verification
// Protecting Routes with JWTs authentication
// File uploading using multer and cloudinary and react
// Fetch Upload images
// Implement Change Password
// Implement sorting,pagination and update fetch images method
// Images delete feature for admins


// Aggregation in MongoDB
// Understanding the aggregation pipeline
// Using common aggregation operators
// Complex data transformation with aggregation
// Aggregation performance optimization
// using $lookup for joining collections
   

// Deployment Stratergies
// prepare Node.js application for production
// Environment variables and configuration  
// Deploying on Render   
// Deploying on Vercel  


      
// Node.js With GraphQL
// Introduction to GraphQL
// Setting UP a GraphQL server with Apollo server   
// Defining GraphQL schema and resolvers
// Querying and mutating data with GraphQL
// integrating GraphQL with mongoDB via mongoose


   
// Node Js with Typescript 
// why use typescript with node js
// Setting up a Node.js project with TypeScript
// Configuring TypeScript with tsconfig.json
// Working with modules and types in TypeScript
// express js with typescript 
// mongoose with typescript    
  
        
app.post('/api/test',(req,res)=>{
  console.log('Received data:',req.body);      
  res.json({message:'Data received successfully',received:req.body});  
});        
  
app.listen(PORT,()=>{       
  console.log(`Server Running on port ${PORT}`);  
});          