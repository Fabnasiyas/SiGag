const userModel = require("../models/userModel");

async function checkUser(req,res,next) {
    const user=await userModel.findOne({_id:req.session.user?.id});
    req.user=user;
    if (user?.block) {
        req.session.user=null;
        return res.redirect("/user-login")
    }else{
        next()
    }   
}
module.exports=checkUser;