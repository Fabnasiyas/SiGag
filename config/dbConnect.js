
const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect('mongodb+srv://faafabin:fabna1998@cluster0.zfliobr.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error sdf: ", err)
    })
}


module.exports= dbConnect; 