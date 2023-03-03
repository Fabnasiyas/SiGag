const { ObjectId } = require('mongoose');
const mongoose = require('mongoose')
const orderSchema= new mongoose.Schema({
    userId:{
        type:String, 
        required:true
    },
   
   
    address:{
        type:Object,
        required:true
    },
   
    orderStatus:{
        type:String, 
        default:'Pending'
    },
    orderDate:{
        type:String,
        required:true,
    },

    paymentStatus:{
        type:Boolean,
        required:true,
        default:false
    },
    payment:{
        type:String,
        required:true
    },
    products:{
        type:Object,
        required:true
    },
    cancel:{
        type:Boolean,
        default:false
    },
    couponStatus:{
        type:Boolean,
        required:true,
        default:false
    },
    totalPrice:{
        
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    
})
const orderModel= mongoose.model("order", orderSchema);

module.exports=orderModel