const mongoose = require('mongoose')

let productSchema = new mongoose.Schema({
    productname:{
        type:String,
        required: true
        
    },
    price:{
        type:Number,
        required: true

    },
    brand:{
        type:String,
        required: true
    },
    category:{
        type:String,
         required:true
    },
    stock:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Object,
        required:true
    },
    sideimage:{
        type:Array,
        required:true
    },
    block:{
        type:Boolean,
        required:true
    },
    createdAt: { type: Date, default: Date.now }

})

    
let productModel = new mongoose.model('productDetails',productSchema)

module.exports=productModel