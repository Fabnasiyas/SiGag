// const { ObjectId } = require('mongoose');
// const mongoose = require('mongoose')
// const orderSchema= new mongoose.Schema({
//     userId:{
//         type:String, 
//         required:true
//     },
   
   
//     address:{
//         type:Object,
//         required:true
//     },
   
//     orderStatus:{
//         type:String, 
//         default:'Pending'
//     },
//     orderDate:{
//         type:Date,
//         required:true,
//     },
    

//     paymentStatus:{
//         type:Boolean,
//         required:true,
//         default:false
//     },
//     payment:{
//         type:String,
//         required:true
//     },
//     products:{
//         type:Object,
//         required:true
//     },
//     cancel:{
//         type:Boolean,
//         default:false
//     },
//     couponStatus:{
//         type:Boolean,
//         required:true,
//         default:false
//     },
//     totalPrice:{
        
//         type:Number,
//         required:true
//     },
//     quantity:{
//         type:Number,
//         required:true
//     },
//     returnstatus:{
//         type:Boolean,
//         required:true,
//         default:false
//     },
    
   
    
// })
// const orderModel= mongoose.model("order", orderSchema);

// module.exports=orderModel
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
        type:Date,
        required:true,
    },
    deliveryDate:{
        type:Date,
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
        
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    returnstatus:{
        type:Boolean,
        required:true,
        default:false
    },
    
   
    
})
const orderModel= mongoose.model("order", orderSchema);

module.exports=orderModel