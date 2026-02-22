const express=require('express')   
const cors=require('cors');   
const app=express()   
app.use(cors(  
     allowlist=['http://localhost:5173','https://frutify.vercel.app']
))         