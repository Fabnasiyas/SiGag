const express = require("express");
const mongoose = require("mongoose");
const dbConnect= require('./config/dbConnect')
const userRouter = require("./routes/user")
const adminRouter=require("./routes/admin")
const path=require('path')
var session=require('express-session')

const app = express();
dbConnect()
app.use(express.json());

app.use(session({
  secret:'secret',
  cookie:{maxAge:600000},
  resave:true,
  saveUninitialized:false
}))

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));




app.use('/',userRouter);
app.use('/admin',adminRouter)


app.listen(4000, () => {
  console.log("http://localhost:4000");
});