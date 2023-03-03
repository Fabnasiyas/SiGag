const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    category:{
        type:String,
        required: true,
        unique:true,
        
    
    },
  
    block:{
        type:Boolean,
    
    }

})

    
let categoryModel = new mongoose.model('categorys',categorySchema)

module.exports=categoryModel