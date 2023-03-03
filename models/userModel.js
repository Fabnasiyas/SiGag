const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    mobile:{
        type:String,
        required: true,
       
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
        required:true
    },
    cart:{
    type:Array,
    required:true
    },
    address:{
    type:Array,
    default:[]
    },
    wishlist:{
        type:Array,
        required:true
    }

})

    
let userModel = new mongoose.model('user',userSchema)

module.exports=userModel    