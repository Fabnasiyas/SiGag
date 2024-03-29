const express = require("express");
const upload = require("../middleware/upload");
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const usercontroller = require("../controllers/usercontroller");
const userVerify = require("../middleware/userVerify");
const admincontroller = require("../controllers/admincontroller");
const router = express.Router();
const checkUser=require('../middleware/blockcheck');
// GET Home page and Login
router.get("/", usercontroller.gethome);
router.get("/user-login", usercontroller.getlogin);
router.post("/user-login", usercontroller.postlogin);

// signup page
router.get("/signup", usercontroller.getsignup);
router.post("/postSignup", usercontroller.postsignup);

router.post("/getotp", usercontroller.postotpPage);
router.get("/resendotp",usercontroller.resendotp)


//  forgot Password
router.get("/forgotpass", usercontroller.getforgotpass);
router.post("/forgotpass", usercontroller.postforgotpass);
router.post('/otpinchangepass',usercontroller.postotpinpasschange)
router.post("/setnewpassword",usercontroller.setnewpassword)
router.get("/viewdetail/:id", usercontroller.getviewproduct);
router.get("/hightolow",usercontroller.hightolow)
router.get('/lowtohigh',usercontroller.lowtohigh)
 router.get('/getbrandprod/:brand',usercontroller.getbrandproducts)
 router.get('/shoppage',usercontroller.getshoppage)
 router.get('/categorypageinshop/:catgy',usercontroller.getcatginshop)
router.get('/categorypage/:catgy',usercontroller.categoryproducts)
router.get("/viewallproducts",usercontroller.getallproducts)
  router.use(userVerify);
  router.use(checkUser);
router.get("/cart",userVerify,usercontroller.getcart);
router.get('/404',usercontroller.get404page)
router.get("/addtocart/:id", userVerify,usercontroller.getaddtocart);
router.post('/viewdetail/:id',usercontroller.getaddtocart)
router.get("/increment/:id", usercontroller.Increment);
router.get("/decrement/:id", usercontroller.Decrement);
router.get('/removefromcart/:id',usercontroller.removefromcart)
router.get('/userprofile',usercontroller.getuserProfile)
router.get('/addaddress',usercontroller.getaddaddress)
router.get('/addAddrsincheckout',usercontroller.getaddaddressincheckout)
router.post('/addAddrsincheckout',usercontroller.postaddressincheckout)
router.post('/addaddress',usercontroller.postaddaddress)
router.get("/editaddress/:id",usercontroller.geteditaddres)
router.post("/editaddress",usercontroller.posteditaddress)
router.get("/deleteaddress/:id",usercontroller.getdeleteaddress);
 router.post('/couponincheckout',usercontroller.applyCoupon)
 router.post('/walletincheckout',usercontroller.getwalletamount)
router.post("/checkout",usercontroller.postcheckout)
router.get("/checkout",usercontroller.getcheckout)
router.get("/orderlistpage",usercontroller.getorderlistpage)
router.get('/vieworderdetails/:id',usercontroller.getvieworder)
router.get('/ordercancel/:id',usercontroller.getordercancel)
 router.get('/orderreturn/:id',usercontroller.getorderreturn)
 router.get('/review/:id',usercontroller.getreview)
 router.post('/userreview/:id',usercontroller.postreview)
 router.get('/wishlist',usercontroller.getwishlist)
 router.get('/towishlist/:id',usercontroller.towishlist)
 router.get('/deletefromwishlist/:id',usercontroller.deletefromwishlist)
 router.get('/verifypayment',usercontroller.getpayment)
// logout
router.get("/logout", usercontroller.getlogout);
module.exports = router;
