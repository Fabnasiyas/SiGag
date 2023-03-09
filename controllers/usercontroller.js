const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const adminModel = require("../models/adminModel");
const sentOTP = require("../helper/otp");
const bcrypt = require("bcrypt");
userVerify = require("../middleware/userVerify");
const { sanitizeFilter, trusted } = require("mongoose");
const { resolve } = require("path");
const createId = require("../helper/craeteId");
const validator = require("validator");
const couponModel = require("../models/couponModel");
const orderModel = require("../models/orderModel");
const mongoose = require("mongoose");
const axios = require("axios");
module.exports = {
  gethome: async (req, res) => {
    try {
      const products = await productModel.find().limit(3).lean();
      const pro = await productModel.find().skip(3).limit(6).lean();
      // const categ = await categoryModel.find({}).lean();

      if (req.session.user) {
        const user = req.session.user.name;
        const allproducts = await productModel.find().lean();
        res.render("index", { error: true, user, products, pro });
      } else {
        res.render("index", { products, pro });
      }
    } catch (error) {
      console.error(error);
      res.render("error");
    }
  },

  // for login  page
  getlogin: (req, res) => {
    res.render("login");
  },
  // for  getting signup page
  getsignup: (req, res) => {
    res.render("signupform");
  },

  postsignup: async (req, res) => {
    try {
      // Validate name field
      if (!req.body.name || req.body.name.length < 3) {
        const message = "Name must be at least 3 characters long";
        return res.render("signupform", { message });
      }
  
      // Validate email field
      if (!req.body.email || !validator.isEmail(req.body.email)) {
        const message = "Please provide a valid email";
        return res.render("signupform", { message });
      }
  
      // Validate password field
      if (!req.body.password || req.body.password.length < 6) {
        const message = "Password must be at least 6 characters long";
        return res.render("signupform", { message });
      }
  
      // Validate mobile field
      if (
        !req.body.mobile ||
        !validator.isMobilePhone(req.body.mobile, "en-IN")
      ) {
        const message = "Please provide a valid mobile number";
        return res.render("signupform", { message });
      }
  
      // If all fields are valid, continue with signup process
      req.session.UserDetails = req.body;
      const userExist = await userModel.findOne({ email: req.body.email });
  
      if (userExist) {
        const message = "Already registered email. Please try with a new email";
        return res.render("signupform", { message });
      } else {
        // generate and send OTP to the user
        const otp = Math.floor(Math.random() * 1000000);
        req.session.signupOTP = otp;
        req.session.signupEmail = req.body.email;
        sentOTP(req.body.email, otp);
        console.log(otp);
        console.log("OTP sent");
        return res.render("forotppage");
      }
    } catch (error) {
      console.error(error); // log the error in the console for debugging purposes
      const errorMessage = "An error occurred: " + error.message; // create an error message for the user
      res.render('signupform', { message: errorMessage }); // display the error message on the page itself
    }
  },
  

  postlogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      let user = await userModel.findOne({ email });
      if (user) {
        if (user.block) {
          return res.render("login", {
            status: true,
            message: "Your account has been blocked.",
          });
        } else if (password == user.password) {
          req.session.userLoggedIn = true;
          req.session.user = {
            name: user.name,
            id: user._id,
          };
          res.redirect("/");
        } else {
          res.render("login", { error: true, status: true });
        }
      } else {
        res.render("login", { error: true, status: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  },

 
  postotpPage: async (req, res) => {
    try {
      if (req.session.signupOTP == req.body.otp) {
        let block = false;
        let UserDetails = req.session.UserDetails;
        const details = await new userModel({ ...UserDetails, block });
        details.save((err, data) => {
          if (err) {
            console.log(err);
            res.render("forotppage", {
              error: true,
              message: "Something went wrong. Please try again later.",
            });
          } else {
            res.redirect("/user-login");
          }
        });
      }
       else {
        res.render("forotppage", {
          error: true,
          message: "The OTP you entered is incorrect. Please try again.",
        });
      }
    } catch (error) {
      console.log(error);
      res.render("forotppage", {
        error: true,
        message: "Something went wrong. Please try again later.",
      });
    }
  },
 
  resendotp: (req, res) => {
    try {
      console.log("resended Otp");
      let otp = Math.floor(Math.random() * 1000000);
      req.session.signupOTP = otp;
      console.log(otp);
      sentOTP(req.session.signupEmail, otp);
      res.render("forotppage");
    } catch (error) {
      console.log(error);
      res.render("forotppage", {
        error: true,
        message: "Something went wrong. Please try again later.",
      });
    }
  },
  
  // for getting forgotpassword page
  getforgotpass: (req, res) => {
    res.render("forgotpassword");
  },
  // for posting forgotpassword page
  postforgotpass: (req, res) => {
    console.log(req.body.email);
    const otp = Math.floor(Math.random() * 1000000);
    req.session.verifyEMAIL=req.body.email
    req.session.verifyOTP=otp;
        sentOTP(req.body.email, otp);
        console.log(otp);
        console.log("OTP sent forpassword change");
       res.render("forgotpassOTP");
    
  },
  
  postotpinpasschange: (req, res) => {
    if(req.session.verifyOTP==req.body.otp){
      res.render("confirmpassword");
    }else{
      res.redirect('back')
    }
    
  },
  setnewpassword:async (req,res)=>{
    const { password, cpassword } = req.body;
    if (password != cpassword) {
      res.render("confirmpassword", { error: true, message: "password Mismatch.!" })
    }
    
  const user = await userModel.findOne({ email:req.session.verifyEMAIL})
  // const hashedPassword = await bcrypt.hash(password, 10)

  console.log(user);
  const updatePassword = await userModel.updateOne({ _id: user.id }, { $set: { password: password } })
  console.log(updatePassword);
res.redirect('/')

  },

 
  getcart: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const { cart } = await userModel.findOne({ _id }, { cart: 1 });

      let cartQuantities = {};
      cart.map((item) => {
        cartQuantities[item.id] = item.quantity;
        return item.quantity;
      });

      const cartList = cart.map((item) => {
        return item.id;
      });
      if (cartList.length === 0) {
        let status = true;
        res.render("cart", { message: "cart is empty", status });
        return;
      }

      const product = await productModel
        .find({ _id: { $in: cartList } })
        .lean();
      let products = product.map((item, index) => {
        return { ...item, quantity: cartQuantities[item._id] };
      });

      let totalprice = 0;
      let Allamount = 0;

      products.forEach((item, index) => {
        totalprice = item.price * item.quantity;
        item.totalprice = totalprice;
      });
      products.forEach((item, index) => {
        Allamount = Allamount + item.price * cart[index].quantity;
      });

      res.render("cart", { products, totalprice, Allamount });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  },

  getviewproduct: async (req, res) => {
    //  const pid=req.params.id

    try {
      const product = await productModel.findOne({ _id: req.params.id });

      res.render("viewproductdetails", { product });
    } catch (error) {
      console.log(error);
    }
  },

  lowtohigh: async (req, res) => {
    try {
      let pricepro
      if (req.session.brandstatus) {
         pricepro = await productModel
        .find({ brand:req.session.brandstatus })
        .sort({ price: 1 })
        .lean();
        
        req.session.brandstatus =false
      } else {
       
        const pricepro = await productModel
        .find()
        .sort({ price: 1 })
        .lean();
        
      }
      let pstatus = true;
      req.session.pricepro = pricepro;
      req.session.pstatus = pstatus;
      res.redirect("/viewallproducts");
    } catch (error) {
      console.log(error);
    }
  },
  hightolow: async (req, res) => {
    try {
      let priceprod;
      let pstatuss = true;
      if (req.session.brandstatus) {
       
        priceprod = await productModel
          .find({ brand: req.session.brandstatus })
          .sort({ price: -1 })
          .lean();
        } else {
          
          priceprod = await productModel
          .find()
          .sort({ price: -1 })
          .lean();
      }
      req.session.pstatuss = pstatuss;
      req.session.priceprod = priceprod;
      res.redirect("/viewallproducts");
    } catch (error) {
      console.log(error);
    }
  },
  getbrandproducts: async (req, res) => {
    try {
      let brandproduct = await productModel
        .find({ brand: req.params.brand })
        .lean();
      let brandstatus = req.params.brand;
      req.session.brandproduct = brandproduct;
      req.session.brandstatus = brandstatus;
      res.redirect("/viewallproducts");
    } catch (error) {
      res.render("errorpage", {
        error: true,
        message: "Something went wrong. Please try again later.",
      });
    }
  },
  
  getshoppage: async (req, res) => {
    try {
        const allproducts = await productModel.find().lean();
        const catgy = req.params.catgy;
        const catgproducts = await productModel.find({ category: catgy }).lean();
        let pstatus = true;
        const categ = await categoryModel.find({}).lean();
        const pricepro = await productModel.find().sort({ price: 1 }).lean();
        res.render("shop", { allproducts, catgproducts, pricepro, pstatus, categ });
    } catch (error) {
        const message = "Something went wrong";
        res.render("error", { message });
    }
},

getaddtocart: async (req, res) => {
    try {
      const uid = req.session.user.id;
      //  console.log("id",uid)
      const pid = req.params.id;
      // console.log("pid",pid)
      const cartiems = await userModel.findByIdAndUpdate(
        { _id: uid },
        { $addToSet: { cart: { id: pid, quantity: 1 } } }
      );

      res.json({ success: true });
    } catch (error) {
      console.log(error);
    }
  },
  
  Increment: async (req, res) => {
    try {
      const pid = req.params.id;
      const product = await productModel.findById(pid);
      const stockValue = product.stock;
      console.log("Stock value: ", stockValue);
      
      await userModel.updateOne(
        {
          _id: req.session.user.id,
          cart: { $elemMatch: { id: req.params.id } },
        },
        {
          $inc: {
            "cart.$.quantity": 1,
          },
        }
      );
      
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
  

  Decrement: async (req, res) => {
    try {
      let { cart } = await userModel.findOne(
        { "cart.id": req.params.id },
        { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
      );
      if (cart[0].quantity <= 1) {
        const pid = req.params.id;
  
        await userModel.updateOne(
          { _id: req.session.user.id },
          { $pull: { cart: { id: pid } } }
        );
        res.json({ success: false });
      } else {
        await userModel.updateOne(
          {
            _id: req.session.user.id,
            cart: { $elemMatch: { id: req.params.id } },
          },
          {
            $inc: {
              "cart.$.quantity": -1,
            },
          }
        );
        res.json({ success: true });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  

  removefromcart: async (req, res) => {
    try {
      const pid = req.params.id;

      await userModel
        .updateOne({ _id: req.session.user.id }, { $pull: { cart: { id: pid } } })
        .then((result) => {
          res.redirect("/cart");
        });
    } catch (error) {
      console.log(error);
      res.redirect("/error");
    }
  },

// getallproducts: async (req, res) => {
//   const brands = await productModel.aggregate([{ $group: { _id: "$brand" } }]);
//   const categ = await categoryModel.find({}).lean();
//   req.session.pageNum = parseInt(req.query.page ?? 1);
//   req.session.perpage = 3;
//   let allproducts = await productModel.find().countDocuments().then(documentCount => {
//     docCount = documentCount;
//     return productModel
//       .find()
//       .skip((req.session.pageNum - 1) * req.session.perpage)
//       .limit(req.session.perpage)
//       .lean();
//   });
//   username = req.session.user;
//   let pageCount = Math.ceil(docCount / req.session.perpage);
//   let pagination = [];
//   for (i = 1; i <= pageCount; i++) {
//     pagination.push(i);
//   }

//   if (req.session.pstatus) {
//     res.render("viewallproducts", {
//       categ,
//       brands,
//       pricepro: req.session.pricepro,
//       pstatus: req.session.pstatus,
//     });
//     req.session.pstatus = false;
//   } else if (req.session.pstatuss) {
//     res.render("viewallproducts", {
//       categ,
//       brands,
//       pstatuss: req.session.pstatuss,
//       priceprod: req.session.priceprod,
//     });
//     req.session.pstatuss = false;
//   } else if (req.session.catstatus) {
//     res.render("viewallproducts", {
//       catgproducts: req.session.catgproducts,
//       status: req.session.catstatus,
//     });
//   } else if (req.session.brandstatus) {
//     res.render("viewallproducts", {
//       categ,
//       brands,
//       brandstatus: req.session.brandstatus,
//       brandproduct: req.session.brandproduct,
//     });
//   } else {
//     res.render("viewallproducts", { allproducts, categ, brands, pagination });
//   }
// },
getallproducts: async (req, res) => {
  try {
    

    const brands = await productModel.aggregate([{ $group: { _id: "$brand" } }]);
    const categ = await categoryModel.find({}).lean();
    req.session.pageNum = parseInt(req.query.page ?? 1);
    req.session.perpage = 3;
    let allproducts = await productModel.find().countDocuments().then(documentCount => {
      docCount = documentCount;
      return productModel
        .find()
        .skip((req.session.pageNum - 1) * req.session.perpage)
        .limit(req.session.perpage)
        .lean();
    });
    username = req.session.user;
    let pageCount = Math.ceil(docCount / req.session.perpage);
    let pagination = [];
    for (i = 1; i <= pageCount; i++) {
      pagination.push(i);
    }

    if (req.session.pstatus) {
      res.render("viewallproducts", {
        categ,
        brands,
        pricepro: req.session.pricepro,
        pstatus: req.session.pstatus,
      });
      req.session.pstatus = false;
    } else if (req.session.pstatuss) {
      res.render("viewallproducts", {
        categ,
        brands,
        pstatuss: req.session.pstatuss,
        priceprod: req.session.priceprod,
      });
      req.session.pstatuss = false;
    } else if (req.session.catstatus) {
      res.render("viewallproducts", {
        catgproducts: req.session.catgproducts,
        status: req.session.catstatus,
      });
      
    } else if (req.session.brandstatus) {
      res.render("viewallproducts", {
        categ,
        brands,
        brandstatus: req.session.brandstatus,
        brandproduct: req.session.brandproduct,
        
      });
      
    } else {
      res.render("viewallproducts", { allproducts, categ, brands, pagination });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
},



  categoryproducts: async (req, res) => {
    try {
      
      const catgy = req.params.catgy;

      const catgproducts = await productModel.find({ category: catgy }).lean();

      res.render("procategory", { catgproducts });
      
    } catch (err) {
      console.error(err);
    }
  },
  getcatginshop: async (req, res) => {
    try {
      const catgy = req.params.catgy;
      const catgproducts = await productModel.find({ category: catgy }).lean();
      let catstatus = true;
      req.session.catstatus = catstatus;
      req.session.catgproducts = catgproducts;
      res.redirect("/viewallproducts");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  
  getuserProfile: async (req, res) => {
    let Address = await userModel
      .findById({
        _id: req.session.user.id,
        address: { $elemMatch: { _id: createId } },
      })
      .lean();
    res.render("profile", { Address });
  },
 
  
  getaddaddress: (req, res) => {
    // req.session.addaddress=true;
    res.render("addressform");
  },
  
  postaddaddress: async (req, res) => {
    try {
      const { name, mobile, pincode, locality, address, city, state } = req.body;
      await userModel.updateOne(
        { _id: req.session.user.id },
        {
          $addToSet: {
            address: {
              name,
              mobile,
              pincode,
              locality,
              address,
              city,
              state,
              id: createId(),
            },
          },
        }
      );
      res.redirect("/userprofile");
    } catch (err) {
      console.error(err);
      res.render("error", { message: "An error occurred while adding address" });
    }
  },
  
  getaddaddressincheckout: (req, res) => {
    res.render("addressform");
  },
  
  postaddressincheckout: async (req, res) => {
    try {
      const { name, mobile, pincode, locality, address, city, state } = req.body;
      await userModel.updateOne(
        { _id: req.session.user.id },
        {
          $addToSet: {
            address: {
              name,
              mobile,
              pincode,
              locality,
              address,
              city,
              state,
              id: createId(),
            },
          },
        }
      );
      res.redirect("/checkout");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  
  geteditaddres: async (req, res) => {
    try{
      
      let addrr = await userModel.findOne(
        { "address.id": req.params.id },
        { _id: 0, address: { $elemMatch: { id: req.params.id } } }
        );
        
        let address = addrr.address.find((e) => e.id == req.params.id);
     
        return res.render("editaddress", { address });
      }catch(err){
        console.log(err);
      }
  },

  posteditaddress: async (req, res) => {
    
    await userModel.updateOne(
      {
        _id: req.session.user.id,
        address: { $elemMatch: { id:req.body.id} },
      },
      {
        $set: {
          "address.$": req.body,
        },
      }
    ).then((result)=>{
      
    });
    res.redirect("/userprofile");
  },
 
  getdeleteaddress: async (req, res) => {
    try {
        await userModel.updateOne(
          {
            _id: req.session.user.id,
            address: { $elemMatch: { id: req.params.id } },
          },
          {
            $pull: {
              address: {
                id: req.params.id,
              },
            },
          }
        );
        res.redirect("/userprofile");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
},

  getcheckout: async (req, res) => {
    try{
    const _id = req.session.user.id;

    const user = await userModel.findById({ _id }).lean();
    const address = user.address;
    //  console.log(address);
    const cart = user.cart;

    let coupons = await couponModel.find().lean();
      console.log(coupons);

    let cartQuantities = {};
    cart.map((item) => {
      cartQuantities[item.id] = item.quantity;
      return item.quantity;
    });

    const cartList = cart.map((item) => {
      return item.id;
    });
    if (cartList.length === 0) {
      let status = true;
      res.render("cart", { message: "cart is empty", status });
      return;
    }

    const product = await productModel.find({ _id: { $in: cartList } }).lean();

    let products = product.map((item, index) => {
      return { ...item, quantity: cartQuantities[item._id] };
    });
    // console.log(products);
    let totalprice = 0;
    let Allamount = 0;
    const shipping = 50;

    products.forEach((item, index) => {
      totalprice = item.price * item.quantity;
      item.totalprice = totalprice;
    });
    products.forEach((item, index) => {
      Allamount = Allamount + item.price * cart[index].quantity;
    });
    Allamount = Allamount + shipping;

    let coupon = req.session.coupon;
    let discount = {};
    if (coupon) {
      if (Allamount > coupon.minAmount) {
        discount.discountedPrice = Allamount - coupon.cashback;

        discount.cashback = coupon.cashback;
      }
    }

    res.render("checkout", {
      products,
      // totalprice,
      address,
      cart,
      user,
      coupons,
      discount,
      Allamount,
    });
    discount = null;
    req.session.coupon = null;
  }
  catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
}
  },

  applyCoupon: (req, res) => {
    return new Promise((resolve, reject) => {
      couponModel.findOne({ code: req.body.coupon }).then((coupon) => {
        req.session.coupon = coupon;
        res.redirect("/checkout");
      });
    });
    
  },

  
  postcheckout: async (req, res) => {
    try {
     
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
  
      const cart = user.cart;
  
      const cartList = cart.map((item) => {
        return item.id;
      });
  
      const { address } = await userModel.findOne({ _id: id }, { address: 1 });
      let found = address.find((e) => (e.address_id = req.body.address));
  
      const product = await productModel.find({ _id: { $in: cartList } }).lean();
  
      let orders = [];
      let i = 0;
 
      for (let item of product) {
        orders.push({
          address: found,
          products: item,
          userId: req.session.user.id,
          quantity: cart[i].quantity,
          totalPrice: cart[i].quantity * item.price,
          payment: req.body.payment,
          discountedPrice:req.body.discountedPrice,
          orderDate: new Date().toLocaleDateString(),
        });
        i++;
      }
      
      req.session.orders = orders;
  
      if (req.body.payment != "cod") {
        let price=req.body.discountedPrice?req.body.discountedPrice:req.body.allAmount
        let orderId = "order_" + createId();
        const options = {
          method: "POST",
          url: "https://sandbox.cashfree.com/pg/orders",
          headers: {
            accept: "application/json",
            "x-api-version": "2022-09-01",
            "x-client-id": process.env.Secret_id,
            "x-client-secret": process.env.secret_key,
            "content-type": "application/json",
          },
          data: {
            order_id: orderId,
            order_amount: price,
            order_currency: "INR",
            customer_details: {
              customer_id: id,
              customer_email: "faafabin@gmail.com",
              customer_phone: "9567918329",
            },
            order_meta: {
              return_url:
                "http://localhost:4000/verifypayment?order_id={order_id}",
            },
          },
        };
  
        await axios
          .request(options)
          .then(function (response) {
            return res.render("paymenttemp", {
              orderId,
              sessionId: response.data.payment_session_id,
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      } else {
        const order = await orderModel.create(orders);
        await userModel.findByIdAndUpdate(
          { _id: id },
          {
            $set: { cart: [] },
          }
        );
  
        res.render("orderSuccess");
      }
    } catch (error) {
      console.error(error);
     
    }},  
    getorderlistpage: async (req, res) => {
      try {
        const id = req.session.user.id;
        let orders = await orderModel.find({ userId: id }).sort({ _id: -1 }).lean();
        res.render("orderpage", { orders });
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
      }
    },

getvieworder: async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send("Invalid order ID");
    }

    let details = await orderModel.find({ _id: orderId }).lean();
    console.log(details);
    res.render("viewinorder", { details });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
},


getordercancel: async (req, res) => {
  try {
    let orderId = req.params.id;

    await orderModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          orderStatus: "canceled",
          cancel: true,
        },
      }
    );
    res.redirect("back");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
},
getorderreturn: async (req, res) => {
  try {
   
    let orderId = req.params.id;
    console.log(".............................."+orderId);
    await orderModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          orderStatus: "Return",
          returnstatus: true,
        },
      }
    );
    res.redirect("back");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
},

  
  getwishlist: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const { wishlist } = await userModel.findOne({ _id }, { wishlist: 1 });
      const wishList = wishlist.map((item) => {
        return item.id;
      });
      const product = await productModel.find({ _id: { $in: wishList } }).sort({ _id: -1 }).lean();
      console.log(product);
      res.render("wishlist", { product });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  
  towishlist: async (req, res) => {

    const wishlist = await userModel.findByIdAndUpdate(
      { _id: req.session.user.id },
      { $addToSet: { wishlist: { id: req.params.id } } }
    );

    res.redirect("back");
  },
  towishlist: async (req, res) => {
    try {
      console.log("pid:" + req.params.id);
      console.log(req.session.user.id);
      const wishlist = await userModel.findByIdAndUpdate(
        { _id: req.session.user.id },
        { $addToSet: { wishlist: { id: req.params.id } } }
      );
  
      res.redirect("back");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  
  deletefromwishlist: async (req, res) => {
    try {
      const pid = req.params.id;
  
      await userModel.updateOne(
        { _id: req.session.user.id },
        { $pull: { wishlist: { id: pid } } }
      );
      res.redirect("back");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  
 
  getpayment: async (req, res) => {
    try {
      const id = req.session.user.id;
      const order_id = req.query.order_id;
      const options = {
        method: "GET",
        url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": "3321752158cd9839af6115045d571233",
          "x-client-secret": "fe3cfb75ce47bef26fcc69a717f59a7c4d71e59c",
          "content-type": "application/json",
        },
      };
  
      const response = await axios.request(options);
      // console.log(req.session.orders);
      if (response.data.order_status == "PAID") {
        const order = await orderModel.create(req.session.orders); //work as insert many
        await userModel.findByIdAndUpdate(
          { _id: id },
          {
            $set: { cart: [] },
          }
        );
  
        res.render("orderSuccess");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  

  // for getting logout page
  getlogout: (req, res) => {
    req.session.user = null;
    res.redirect("/user-login");
  },
};
