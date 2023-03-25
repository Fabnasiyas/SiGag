
require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const dbConnect= require('./config/dbConnect')
const adminRouter=require("./routes/admin")
const userRouter = require("./routes/user")
const path=require('path')
var session=require('express-session')
 

// const morgan= require('morgan')
const hbs=require('hbs')
const app = express();
dbConnect()
app.use(express.json());
// app.use(morgan('dev'))
app.use((req,res,next)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  next();
})
app.use(session({
  secret:'secret',
  cookie:{maxAge:600000},
  resave:true,
  saveUninitialized:false,
   
}))

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


hbs.registerHelper('inc',function(value,options){
  return parseInt(value)+1;
});

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use('/admin',adminRouter)
app.use('/',userRouter);
app.use(function(err, req, res, next) {
  console.error(err);
  if (err) {
    res.status(err.status || 404).render('404', { message: err.message });
  }
});

app.all('*',(req,res)=>{
  res.render('404');
})
app.listen(4000, () => {
  console.log("http://localhost:4000");
});