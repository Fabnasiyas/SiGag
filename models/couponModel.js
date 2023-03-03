const mongoose = require('mongoose')

let couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
        
    },
    code:{
        type:String,
        required: true
        
    },
    minAmount:{
        type:Number,
        required: true
    },
    cashback:{
        type:Number,
         required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        default:'available'
    },
    block:{
        type:Boolean,
        required:true
    },
    
})

    
let couponModel = new mongoose.model('coupon',couponSchema)

module.exports=couponModel