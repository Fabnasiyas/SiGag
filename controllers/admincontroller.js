const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const adminModel = require("../models/adminModel");
const couponModel = require("../models/couponModel");
const bannerModel=require("../models/bannerModel");
var mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const { truncate } = require("fs");
const sanitizer = require('sanitizer');
const sharp = require('sharp');

module.exports = {
  // for getting Admin Login Page
  getadminLogin: (req, res) => {
    res.render("adminloginPage");
  },
  // for posting Admin Login Page
  postadminLogin: async (req, res) => {
    const { email, password } = req.body;
    let admin = await adminModel.findOne({ email });
    if (admin) {
      if (password == admin.password) {
        req.session.admin = {
          name: admin.name,
        };
        res.redirect("/admin/");
      } else {
        console.log("error");
        res.redirect("back");
      }
    } else {
      res.redirect("back");
    }
  },
  // for getting Admin Dashbord
  adminHome:async(req, res) => {
    if (req.session.admin) {
      try {
        const orderCount = await orderModel.countDocuments().lean();
        const deliveredOrders = await orderModel.find({ orderStatus: "delivered" }).lean();
        let totalRevenue = 0;
        let Orders = await Promise.all(deliveredOrders.map(async (item) => {
            totalRevenue = totalRevenue + item.totalPrice;
            return item;
        }));
  const monthlyDataArray = await orderModel.aggregate([
            { $match: { orderStatus: "delivered" } },

            {
                $group: {
                    _id: { $month:"$orderDate"},
                    sum: { $sum:"$totalPrice" }
                }
            },
        ])        

        const monthlyReturnArray = await orderModel.aggregate([
            {
                $match: { orderStatus: "Return" }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    sum: { $sum: "$totalPrice" }
                }
            }
        ]);
        let monthlyDataObject = {};
        let monthlyReturnObject = {}
        monthlyDataArray.map((item) => {
            monthlyDataObject[item._id] = item.sum;
        });
        monthlyReturnArray.map(item => {
            monthlyReturnObject[item._id] = item.sum
        })
        let monthlyReturn = []
        for (let i = 1; i <= 12; i++) {
            monthlyReturn[i - 1] = monthlyReturnObject[i] ?? 0
        }
        let monthlyData = [];
        for (let i = 1; i <= 12; i++) {
            monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
        }
        const online = await orderModel.find({ payment: "online" }).countDocuments().lean();
        const cod = await orderModel.find({ payment: "cod" }).countDocuments().lean();
        const userCount = await userModel.countDocuments().lean();

        const productCount = await productModel.countDocuments().lean();
        res.render("dashboard", {
            totalRevenue,
            orderCount,
            monthlyData,
            monthlyReturn,
            online,
            cod,
            productCount,
            userCount,
        });
    } catch (error) {
        console.log(error)
    }

      // res.render("dashboard");
    } else {
      res.redirect("/admin/login");
    }
  },
  // for getting User Details Page
  getuserlist: async (req, res) => {
    const user = await userModel.find().sort({ _id: -1 }).lean();
    res.render("UserList", { user });
  },
  getbanner:async(req,res)=>{
    const banner=await bannerModel.find().lean()
    res.render('Banner',{banner})
  },
  getaddbanner:(req,res)=>{
res.render('addbanner')
  },
  postaddbanner:async(req,res)=>{
    try {
    await bannerModel.create(
      {
        name:req.body.name,
        image: req.files.image,
      }
     
    )
    res.redirect('/admin/banner')  
    } catch (error) {
      res.redirect('/404'); 
    }
  },
  deletebanner:async(req,res)=>{
    try {
      // const bannerId = req.params.id;
      let bannerId = sanitizer.sanitize(req.params.id); 
      await bannerModel.deleteOne({ _id: bannerId });
      res.redirect('/admin/banner')
    } catch (error) {
          console.error(error);
          res.status(500).send("Internal server error");
        }
  },
  
  
  
  // for user blocking
  blockuser: async (req, res) => {
    // const uid = req.params.id;
    let uid = sanitizer.sanitize(req.params.id); 
    userModel.findByIdAndUpdate(
      { _id: uid },
      { $set: { block: true } },
      function (error, data) {
        if (error) {
          res.redirect("/admin/user-list");
        } else {
          res.redirect("/admin/user-list");
        }
      }
    );
  },
  // for user unblocking
  unblockuser: async (req, res) => {
    const uid = req.params.id;
    userModel.findByIdAndUpdate(
      { _id: uid },
      { $set: { block: false } },
      function (error, data) {
        if (error) {
          res.redirect("/admin/user-list");
        } else {
          res.redirect("/admin/user-list");
        }
      }
    );
  },
  getsearchuser: async (req, res) => {
    try {
      let query = req.body.name;
      let user = await userModel.find({$or: [{ name: new RegExp(query, "i") }, { email: query }]}).lean();
      res.render("UserList", { user });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while searching for user");
    }
  },
  searchproduct:async(req,res)=>{
    try{
      let  prod=req.body.name;
      let  product=await productModel.find({productname: new RegExp(prod, "i")}).lean()
      res.render("productList", { product });
      } 
    
catch (error) {
  console.error(error);
  res.status(500).send("An error occurred while searching for coupon");
}
},
couponsearch:async(req,res)=>{
  try{
    let  coupon=req.body.name;
    let  coupons=await couponModel.find({name: new RegExp(coupon, "i")}).lean()
    res.render("coupon", { coupons });
    } 
  
catch (error) {
console.error(error);
res.status(500).send("An error occurred while searching for products");
}
},
  // for getting productlist page
  getproductlist: async (req, res) => {
    const product = await productModel.find().sort({ createdAt: -1 }).lean();

    res.render("productList", { product });
  },
  // for getting add product
  getaddProduct: async (req, res) => {
    const categorys = await categoryModel.find().sort({ _id: -1 }).lean();
    res.render("addProduct", { categorys });
  },
  postaddProduct: async (req, res) => {
    const { productname, price, brand, category, stock, description } = req.body;
    const image = req.files.image[0];
    const sideimage = req.files.sideimage;
      sharp(image.path)
          .png()
          .resize(300, 300, {
              kernel: sharp.kernel.nearest,
              fit: 'contain',
              position: 'center',
              background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toFile(image.path + ".png")
          .then(() => {
              image.filename = image.filename + ".png"
              image.path = image.path + ".png"
          })  

    const product = await productModel.create({
      productname,
      price,
      brand,
      category,
      stock,
      description,
      block: false,
      image: image,
      sideimage: sideimage,
    });
  
    res.redirect("/admin/product-list");
  },
 
  unlistProduct: async (req, res) => {
    const pid = req.params.id;

    await productModel.updateOne(
      { _id: pid },
      { $set: { block: false } },

      res.redirect("back")
    );
  },
  listProduct: async (req, res) => {
    const pid = req.params.id;
    await productModel.updateOne(
      { _id: pid },
      { $set: { block: true } },

      res.redirect("back")
    );
  },
  
geteditProduct: async (req, res) => {
  try {
    let id = sanitizer.sanitize(req.params.id); 
    const pro = await productModel.findOne({ _id: id }).lean();
    const result = await categoryModel.find().lean();

    res.render("editProduct", { pro, result });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/product-list");
  }
},

  // for posting editproduct page
  posteditProduct: (req, res) => {
    // const _id = req.params.id;
    let _id = sanitizer.sanitize(req.params.id); 

    const {
      productname,
      price,
      brand,
      category,
      stock,
      description,
      image,
      sideimage,
    } = req.body;

    if (req.files.image && req.files.sideimage) {
      productModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            productname,
            price,
            brand,
            category,
            stock,
            description,
            image: req.files.image[0],
            sideimage: req.files.sideimage,
          },
        },
        (err, data) => {
          if (err) {
            res.redirect("back");
          } else {
            res.redirect("/admin/product-list");
          }
        }
      );
    } else if (req.files.image && !req.files.sideimage) {
      productModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            productname,
            price,
            brand,
            category,
            stock,
            description,
            image: req.files.image[0],
          },
        },
        (err, data) => {
          if (err) {
            res.redirect("back");
          } else {
            res.redirect("/admin/product-list");
          }
        }
      );
    } else if (!req.files.image && req.files.sideimage) {
      productModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            productname,
            price,
            brand,
            category,
            stock,
            description,
            sideimage: req.files.sideimage,
          },
        },
        (err, data) => {
          if (err) {
            res.redirect("back");
          } else {
            res.redirect("/admin/product-list");
          }
        }
      );
    } else if (!req.files.image && !req.files.sideimage) {
      productModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            productname,
            price,
            brand,
            category,
            stock,
            description,
          },
        },
        (err, data) => {
          if (err) {
            res.redirect("back");
          } else {
            res.redirect("/admin/product-list");
          }
        }
      );
    }
  },

  // for getting  category List page
  getcategory: async (req, res) => {
    let categorys = await categoryModel.find({}).sort({ _id: -1 }).lean();
    res.render("category", { categorys });
  },
  // for getting add category page
  getaddcategory: (req, res) => {
    res.render("addcategory", { error: false });
  },

  savecategory: async (req, res) => {
    try {
      const { category } = req.body;
      const categorys = await categoryModel.findOne({
        category: { $regex: new RegExp(category, "i") },
      });

      if (categorys) {
        res.render("addcategory", { error: true });
      } else {
        const categ = new categoryModel({ category: category.toLowerCase() });

        categ.save((err, data) => {
          if (err) {
            res.send(err);
            console.log(err);
          }
          res.redirect("/admin/category-list");
        });
      }
    } catch (err) {
      res.send(err);
    }
  },
  // for blocking a category
  blockcategory: async (req, res) => {
    // const uid = req.params.id;
    let uid = sanitizer.sanitize(req.params.id); 
    categoryModel.findByIdAndUpdate(
      { _id: uid },
      { $set: { block: true } },
      function (error, data) {
        if (error) {
          res.redirect("/admin/category-list");
        } else {
          res.redirect("/admin/category-list");
        }
      }
    );
  },
  // for unblocking a category
  unblockcategory: async (req, res) => {
    // const uid = req.params.id;
    let uid = sanitizer.sanitize(req.params.id); 
    categoryModel.findByIdAndUpdate(
      { _id: uid },
      { $set: { block: false } },

      function (error, data) {
        if (error) {
          res.redirect("/admin/category-list");
        } else {
          res.redirect("/admin/category-list");
        }
      }
    );
  },
  // for getting order list page
  getorderlist: async (req, res) => {
    let order = await orderModel.find().sort({ _id: -1 }).lean();
    for (const i of order) {
      i.orderDate=new Date(i.orderDate).toDateString()
    }

    res.render("orderListinadmin", { order });
  },
  getcoupon: async (req, res) => {
    let coupons = await couponModel.find().sort({ _id: -1 }).lean();
    if (coupons) {
      for (const i of coupons) {
        i.expiry = i.expiry.toLocaleDateString();
      }
    }
    res.render("coupon", { coupons });
  },

  getaddcoupon: (req, res) => {
    res.render("addCoupon");
  },

//   postaddcoupon: async (req, res) => {
//     try {
//       const { name, code, minAmount, cashback, expiry } = req.body;

//       // Check if the coupon code already exists (case-insensitive)
//       const existingCoupon = await couponModel.findOne({
//         code: { $regex: `^${code}$`, $options: "i" },
//       });

//       if (existingCoupon) {
//         // Coupon code already exists, send an error message
//         return res.render("addcoupon", { error: "Coupon code already exists" });
//       }

//       const existingname = await couponModel.findOne({
//         name: { $regex: `^${name}$`, $options: "i" },
//       });
//       if (existingname) {
//         // Coupon name already exists, send an error message
//         return res.render("addcoupon", {
//           cerror: "Coupon name already exists",
//         });
//       }
//       const dateParts = expiry.split('/');
// const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
// const newCoupon = await couponModel.create({
//   name,
//   code,
//   minAmount,
//   cashback,
//   expiry: formattedDate,
//   block: false,
// });


//       // Create a new coupon with the provided information
//       // const newCoupon = await couponModel.create({
//       //   name,
//       //   code,
//       //   minAmount,
//       //   cashback,
//       //   expiry: new Date().toLocaleDateString(),
//       //   block: false,
//       // });

      
//       res.redirect("/admin/coupons");
//     } catch (error) {
//       console.error(error); 
//       const errorMessage = "An error occurred: " + error.message; 
//       res.render("addcoupon", { error: errorMessage }); 
//     }
//   },
postaddcoupon: async (req, res) => {
  try {
      const { name, code, minAmount, cashback, expiry } = req.body;

      // Check if the coupon code already exists (case-insensitive)
      const existingCoupon = await couponModel.findOne({
          code: { $regex: `^${code}$`, $options: "i" },
      });

      if (existingCoupon) {
          // Coupon code already exists, send an error message
          return res.render("addcoupon", { error: "Coupon code already exists" });
      }

      const existingname = await couponModel.findOne({
          name: { $regex: `^${name}$`, $options: "i" },
      });
      if (existingname) {
          // Coupon name already exists, send an error message
          return res.render("addcoupon", {
              cerror: "Coupon name already exists",
          });
      }

      // Validate the expiry date
      const expiryDate = new Date(expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date

      if (expiryDate < today) {
          return res.render("addcoupon", { derror: "Expiry date cannot be before today's date" });
      }

      const dateParts = expiry.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      const newCoupon = await couponModel.create({
          name,
          code,
          minAmount,
          cashback,
          expiry: formattedDate,
          block: false,
      });

      res.redirect("/admin/coupons");
  } catch (error) {
      console.error(error);
      const errorMessage = "An error occurred: " + error.message;
      res.render("addcoupon", { error: errorMessage });
  }
},


  geteditcoupon: async (req, res) => {
    try {
      // const _id = req.params.id;
      let _id = sanitizer.sanitize(req.params.id); 
      const coupon = await couponModel.findOne({ _id }).lean();
      res.render("editcoupon", { coupon });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/coupons");
    }
  },
  posteditcoupon: async (req, res) => {
    let block = false;
    const { name, code, expiry, minAmount, cashback, _id } = req.body;
    
    try {
      await couponModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            name,
            code,
            expiry,
            minAmount,
            cashback,
            block,
          },
        },
        { new: true }
      );
      res.redirect("/admin/coupons");
    } catch (error) {
      console.log(error);
      res.render("editcoupon");
    }
  },
  unlistcoupon: async (req, res) => {
    // const cid = req.params.id;
    let orderId = sanitizer.sanitize(req.params.id); 

    await couponModel.updateOne(
      { _id: cid },
      { $set: { block: false } },

      res.redirect("back")
    );
  },
  listcoupon: async (req, res) => {
    // const cid = req.params.id;
    let orderId = sanitizer.sanitize(req.params.id); 
    // console.log(pid);
    await couponModel.updateOne(
      { _id: cid },
      { $set: { block: true } },

      res.redirect("back")
    );
  },
  getorderpending: async (req, res) => {
    let orderId = req.params.id;
    await orderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: "pending",
        },
      }
    );
  },
  getordercancel: async (req, res) => {
    // let orderId = req.params.id;
    let orderId = sanitizer.sanitize(req.params.id); 
    await orderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: "canceled",
        },
      }
    );
  },
  getordershipped: async (req, res) => {
    // let orderId = req.params.id;
    let orderId = sanitizer.sanitize(req.params.id); 
    await orderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: "shipped",
        },
      }
    );
  },
  getorderdelivered: async (req, res) => {
    // let orderId = req.params.id;
    let orderId = sanitizer.sanitize(req.params.id); 
    await orderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: "delivered",         
          deliveryDate:new Date(),
          returnstatus: true,
          cancel: true,
        },
      }
    );
  },
  getorderreturn: async (req, res) => {
    // let orderId = req.params.id;
    let orderId = sanitizer.sanitize(req.params.id); 
    await orderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: "Return",
        },
      }
    );
  },
  getsalesreport:async(req,res)=>{
    let orders
        let deliveredOrders
        let salesCount
        let salesSum
        let result
        let start = new Date(new Date().setDate(new Date().getDate() - 8));
        let end = new Date();
        let filter = req.query.filter ?? "";

        if (req.query.start) start = new Date(req.query.start);
        if (req.query.end) end = new Date(req.query.end);
        if (req.query.start) {
        
            orders = await orderModel.find({ orderDate: { $gte: start, $lte: end } }).lean()

            deliveredOrders = orders.filter(order => order.orderStatus === "delivered")
            salesCount = await orderModel.countDocuments({ orderDate: { $gte: start, $lte: end }, orderStatus: "delivered" })
            salesSum = deliveredOrders.reduce((acc, order) => acc + order.totalPrice, 0)
            

        } else {

            // deliveredOrders = await orderModel.find({ orderStatus: "delivered" }).lean()
            deliveredOrders = await orderModel.find({ orderStatus: "delivered" }).sort({ orderDate: -1 }).lean();

            for (const i of deliveredOrders) {
              i.orderDate=new Date(i.orderDate).toDateString()
              
            }
            salesCount = await orderModel.countDocuments({ orderStatus: "delivered" })
            result = await orderModel.aggregate([{ $match: { orderStatus: "delivered" } },
            {
                $group: { _id: null, totalPrice: { $sum: '$totalPrice' } }
            }])
            salesSum = result[0]?.totalPrice
        }
        const users = await orderModel.distinct('userId')
        const userCount = users.length
        res.render('salesreport', { userCount, salesCount, salesSum, deliveredOrders })
    },
// res.render('salesreport');
  

  adminlogut: (req, res) => {
    req.session.admin = null;

    res.redirect("/admin/login");
  },
};
