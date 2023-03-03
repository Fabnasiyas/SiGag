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
const mongoose = require('mongoose');
const axios=require('axios')
module.exports = {
  gethome: async (req, res) => {
    try {
      const products = await productModel.find().limit(3).lean();
      const pro = await productModel.find().skip(3).limit(6).lean();
      const categ = await categoryModel.find({}).lean();

      if (req.session.user) {
        const user = req.session.user.name;
        const allproducts = await productModel.find().lean();
        res.render("index", { error: true, user, products, pro, categ });
      } else {
        res.render("index", { products, pro, categ });
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

  // post otp page
  postotpPage: async (req, res) => {
    if (req.session.signupOTP == req.body.otp) {
      let block = false;
      let UserDetails = req.session.UserDetails;
      const details = await new userModel({ ...UserDetails, block });
      details.save((err, data) => {
        if (err) {
          console.log(err);
          res.render("forotppage");
        } else {
          res.redirect("/user-login");
          
        }
      });
    } else {
      res.render("forotppage", {
        error: true,
        message: "something went Wrong ",
      });
      res.render("forotppage");
    }
  },
  resendotp: (req, res) => {
    console.log("resended Otp");
    let otp = Math.floor(Math.random() * 1000000);
    req.session.signupOTP = otp;
    console.log(otp);
    sentOTP(req.session.signupEmail, otp);
    res.render("forotppage");
  },
  // for getting forgotpassword page
  getforgotpass: (req, res) => {
    res.render("forgotpassword");
  },
  // for posting forgotpassword page
  postforgotpass: (req, res) => {
    
    res.render("newpassword");
  },
  verifyotpinchangepass:(req,res)=>{
    res.render('forgotpassOTP')
  },
  postotpinpasschange:(req,res)=>{
    res.render('confirmpassword')
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

  pricesorting: async (req, res) => {
    try {
      let pstatus = true;
      const pricepro = await productModel.find().sort({ price: 1 }).lean();
      // console.log(pricepro);
      res.render("viewallproducts", { pricepro, pstatus });
      console.log('price wise')
    } catch (error) {
      console.log(error);
    }
  },
  getshoppage: async(req, res) => {
     const allproducts = await productModel.find().lean();
     const catgy = req.params.catgy;

      const catgproducts = await productModel.find({ category: catgy }).lean();
let pstatus = true;
const categ = await categoryModel.find({}).lean();
const pricepro = await productModel.find().sort({ price: 1 }).lean();
    res.render("shop",{ allproducts,catgproducts ,pricepro, pstatus ,categ });
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

    res.json({success:true})
    } catch (error) {
      console.log(error);
    }
  },
  Increment: (req, res) => {
    const pid = req.params.id;
    productModel.findById(pid, function (err, product) {
      if (err) {
        console.log(err);
      } else {
        // Retrieve the stock value from the product model instance
        const stockValue = product.stock;
        console.log("Stock value: ", stockValue);
      }})
    return new Promise((resolve, reject) => {
     
      userModel
        .updateOne(
          {
            _id: req.session.user.id,
            cart: { $elemMatch: { id: req.params.id } },
          },
          {
            $inc: {
              "cart.$.quantity": 1,
            },
          }
        )
        .then((result) => {
          res.redirect("/cart");
        });
    });
  },
  Decrement: async (req, res) => {
    let { cart } = await userModel.findOne(
      { "cart.id": req.params.id },
      { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
    );
    if (cart[0].quantity <= 1) {
      const pid = req.params.id;

      await userModel
        .updateOne(
          { _id: req.session.user.id },
          { $pull: { cart: { id: pid } } }
        )
        .then((result) => {
          res.redirect("/cart");
        });
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

      res.redirect("/cart");
    }
  },
  removefromcart: async (req, res) => {
    const pid = req.params.id;

    await userModel
      .updateOne({ _id: req.session.user.id }, { $pull: { cart: { id: pid } } })
      .then((result) => {
        res.redirect("/cart");
      });
  },

  getallproducts: async (req, res) => {
    const allproducts = await productModel.find().lean();
    const categ = await categoryModel.find({}).lean();
    res.render("viewallproducts", { allproducts,categ });
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
  getcatginshop:async(req,res)=>{
    const catgy = req.params.catgy;
    
    const catgproducts = await productModel.find({ category: catgy }).lean();

let status=true;
console.log(catgproducts);
    res.render("viewallproducts", { catgproducts,status });
   
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
    const { name, mobile, pincode, locality, address, city, state } = req.body;
    // console.log(req.body);
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
  },
  getaddaddressincheckout: (req, res) => {
    // req.session.addaddress=true;
    res.render("addressform");
  },
  postaddressincheckout:async (req, res) => {
    const { name, mobile, pincode, locality, address, city, state } = req.body;
    // console.log(req.body);
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
  },
    geteditaddres: async (req, res) => {
    let addrr = await userModel.findOne(
      { "address.id": req.params.id },
      { _id: 0, address: { $elemMatch: { id: req.params.id } } }
    );
    console.log("start");
    let address = await addrr.address.find((e) => e.id == req.params.id);
    res.render("editaddress", { address });
    console.log("done");
  },

  posteditaddress: async (req, res) => {
    await userModel.updateOne(
      {
        _id: req.session.user.id,
        address: { $elemMatch: { id: req.body.id } },
      },
      {
        $set: {
          "address.$": req.body,
        },
      }
    );
    res.redirect("/userprofile");
  },
  getdeleteaddress: async (req, res) => {
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
  },
  getcheckout: async (req, res) => {
    const _id = req.session.user.id;

    const user = await userModel.findById({ _id }).lean();
    const address = user.address;
    //  console.log(address);
    const cart = user.cart;

    let coupons = await couponModel.find().lean();
    //  console.log(coupons);

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
  },

  applyCoupon: (req, res) => {
   
    return new Promise((resolve, reject) => {
      couponModel.findOne({ code: req.body.coupon }).then((coupon) => {
        req.session.coupon = coupon;
        res.redirect("/checkout");
      });
    });
    // res.redirect("/checkout");
    // res.render("checkout");
  },

  postcheckout: async (req, res) => {
    const id = req.session.user.id;
    // console.log("user id is.........."+id);
    const user = await userModel.findById({ _id: id }).lean();
    // console.log("user is ;" + user);

    const cart = user.cart;
 
    const cartList = cart.map((item) => {
      return item.id;
    });
  

    const { address } = await userModel.findOne({ _id: id }, { address: 1 });
    //  console.log(address);
    let found = address.find((e) => (e.address_id = req.body.address));

    //  console.log(found);

    const product = await productModel.find({ _id: { $in: cartList } }).lean();
    //  console.log(product);
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
        orderDate: new Date().toLocaleDateString(),
      });
      i++;
    } 
  req.session.orders=orders    
    //  3321752158cd9839af6115045d571233 api key
// fe3cfb75ce47bef26fcc69a717f59a7c4d71e59c  secret key
    // console.log(orders);
    if(req.body.payment !='cod'){
      let orderId = "order_" + createId();
      const options = {
          method: "POST",
          url: "https://sandbox.cashfree.com/pg/orders",
          headers: {
              accept: "application/json",
              "x-api-version": "2022-09-01",
              "x-client-id": '3321752158cd9839af6115045d571233',
              "x-client-secret": 'fe3cfb75ce47bef26fcc69a717f59a7c4d71e59c',
              "content-type": "application/json",
          },
          data: {
              order_id: orderId,
              order_amount: req.body.allAmount,
              order_currency: "INR",
              customer_details: {
                  customer_id: id,
                  customer_email: 'faafabin@gmail.com',
                  customer_phone: '9567918329',
              },
              order_meta: {
                  return_url: "http://localhost:4000/verifypayment?order_id={order_id}",
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

    }
else{
  const order = await orderModel.create(orders); //work as insert many
  await userModel.findByIdAndUpdate(
    { _id: id },
    {
      $set: { cart: [] },
    }
  );

  res.render("orderSuccess");

}
},   

  getorderlistpage: async (req, res) => {
    const id = req.session.user.id;
    let orders = await orderModel.find({ userId: id }).lean();
    //  console.log(orders);
    res.render("orderpage", { orders });
  },
//   getvieworder: async (req, res) => {
//     // const orderId = req.params.id;
// console.log("viewwww"+req.params.id);
//     let details = await orderModel.find({ _id: req.params.id }).lean();
    
//     res.render("viewinorder", { details });
//   },


getvieworder: async (req, res) => {
    const orderId = req.params.id;
    

    // Check if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).send('Invalid order ID');
        
    }

    let details = await orderModel.find({ _id: orderId }).lean();
    
    res.render("viewinorder", { details });
},


  getordercancel:  async(req, res) => {
    let orderId = req.params.id
      
     
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
  },
  getwishlist:async(req,res)=>{
    const _id = req.session.user.id;
    const { wishlist } = await userModel.findOne({ _id }, { wishlist: 1 });
    const wishList = wishlist.map((item) => {
      return item.id;
    });
    const product = await productModel
    .find({ _id: { $in: wishList } })
    .lean();
    console.log(product);
    res.render('wishlist',{product})
  },
  towishlist:async (req,res)=>{
    console.log("pid:"+req.params.id);
    console.log(req.session.user.id);
    const wishlist=await userModel.findByIdAndUpdate({_id:req.session.user.id},{$addToSet:{wishlist:{id:req.params.id}}})
    
    res.redirect("back");


  },
  deletefromwishlist:async (req, res) => {
    const pid = req.params.id;

    await userModel
      .updateOne({ _id: req.session.user.id }, { $pull: { wishlist: { id: pid } } })
      .then((result) => {
        res.redirect("back");
      });
  },
  // getpayment:async (req,res)=>{
    
  //     const order_id = req.query.order_id;
  //     const options = {
  //         method: "GET",
  //         url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
  //         headers: {
  //             accept: "application/json",
  //             "x-api-version": "2022-09-01",
  //             "x-client-id": '3321752158cd9839af6115045d571233',
  //             "x-client-secret": 'fe3cfb75ce47bef26fcc69a717f59a7c4d71e59c',
  //             "content-type": "application/json",
  //         },
  //     };

  //     const response = await axios.request(options);


  //     if (response.data.order_status == "PAID") {
  //       const order = await orderModel.create(orderitems); //work as insert many
  // await userModel.findByIdAndUpdate(
  //   { _id: id },
  //   {
  //     $set: { cart: [] },
  //   }
  // );

  // res.render("orderSuccess");
  //     }

 

  // },
  getpayment: async (req, res) => {
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
  console.log(req.session.orders);
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
  },
  
  // for getting logout page
  getlogout: (req, res) => {
    req.session.user = null;
    res.redirect("/user-login");
  },
};
