const adminController=require('../controllers/admincontroller');
const express=require('express');

const upload=require('../middleware/upload');
const userModel=require('../models/userModel');
const adminModel=require('../models/adminModel');
const multer = require('multer');
const verifyAdmin=require('../middleware/adminVerify');
const usercontroller = require('../controllers/usercontroller');
const admincontroller = require('../controllers/admincontroller');
const router=express.Router();

  
   // GET AdminHome page and Login
   router.get('/',adminController.adminHome);
   router.get('/login',adminController.getadminLogin)
   router.post('/login',adminController.postadminLogin);
 
   // User Managment
   router.use(verifyAdmin);
   
   router.get('/user-list',adminController.getuserlist);
   router.get('/blockuser/:id',adminController.blockuser);
   router.get('/unblockuser/:id',adminController.unblockuser);

   // product Managment
   router.get('/product-list',adminController.getproductlist);
   router.get('/add-product',upload,adminController.getaddProduct);
   router.post ('/add-product',upload,adminController.postaddProduct);
   router.get('/unlistproduct/:id',adminController.unlistProduct);
   router.get('/listproduct/:id',adminController.listProduct);
   router.get('/editproduct/:id',upload,adminController.geteditProduct)
   router.post('/edit-product/:id',upload,adminController.posteditProduct)
   router.post('/userList',adminController.getsearchuser)
   router.post('/producrsearch',upload,adminController.searchproduct)
   // Category Managment
  
   router.get('/category-list',adminController.getcategory);
   router.get('/add-category',adminController.getaddcategory);
   router.post('/save-category',adminController.savecategory);
   router.get('/blockcategory/:id',adminController.blockcategory);
   router.get('/unblockcategory/:id',adminController.unblockcategory);
   
   router.get('/order-list',adminController.getorderlist);
   
   router.get('/coupons',adminController.getcoupon)
   router.get('/addcoupon',adminController.getaddcoupon)
   router.post('/addcoupon',adminController.postaddcoupon)
    router.get('/editcoupon/:id',adminController.geteditcoupon)
    router.post('/editCoupon',adminController.posteditcoupon)
   //  router.post('/deletecoupon/:id',adminController.deletecoupon)
   router.get('/unlistcoupon/:id',adminController.unlistcoupon);
   router.get('/listcoupon/:id',adminController.listcoupon);
   router.post('/couponsearch',adminController.couponsearch)
   // router.get('/searchcategory',adminController.searchcategory)
router.get('/banner',adminController.getbanner)
router.get('/addbanner',upload,adminController.getaddbanner);
router.post('/savebanner',upload,admincontroller.postaddbanner);
router.get('/deletebanner/:id',admincontroller.deletebanner)
router.get('/order-pending/:id',adminController.getorderpending)
router.get("/order-cancel/:id",adminController.getordercancel)
router.get('/order-shipped/:id',adminController.getordershipped)
router.get('/admin/order-return/:id',adminController.getorderreturn)
router.get('/order-delivered/:id',adminController.getorderdelivered)
router.get('/salesreport',adminController.getsalesreport)
router.get('/logout',adminController.adminlogut)


module.exports = router;