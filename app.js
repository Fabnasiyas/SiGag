
require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const dbConnect= require('./config/dbConnect')
const userRouter = require("./routes/user")
const adminRouter=require("./routes/admin")
const path=require('path')
var session=require('express-session')
const MongoStore = require('connect-mongo');

// const morgan= require('morgan')
const hbs=require('hbs')
const app = express();
dbConnect()
app.use(express.json());
// app.use(morgan('dev'))

app.use(session({
  secret:'secret',
  cookie:{maxAge:600000},
  resave:true,
  saveUninitialized:false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/project-sigag' })
}))

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


hbs.registerHelper('inc',function(value,options){
  return parseInt(value)+1;
});

app.use('/',userRouter);
app.use('/admin',adminRouter)


app.listen(4000, () => {
  console.log("http://localhost:4000");
});