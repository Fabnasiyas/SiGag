const mongoose = require('mongoose')

let bannerSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
        
    },
    image:{
        type:Object,
        required:true
    }

    
})

    
let bannerModel = new mongoose.model('banner',bannerSchema)

module.exports=bannerModel