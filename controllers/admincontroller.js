const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const adminModel = require("../models/adminModel");
const couponModel = require("../models/couponModel");
var mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const { truncate } = require("fs");
// import sharp from "sharp";
// import moment from "moment";
// import fs from 'fs'
// import { promisify } from 'util'
// const unlinkAsync = promisify(fs.unlink)
module.exports = {
  
  // for getting Admin Login Page
  getadminLogin: (req, res) => {
    res.render("adminloginPage");
  },
  // for posting Admin Login Page
  postadminLogin: async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    let admin = await adminModel.findOne({ email });
    console.log(admin);
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
  adminHome: (req, res) => {
    if (req.session.admin) {
      res.render("dashboard");
    } else {
      res.redirect("/admin/login");
    }
  },
  // for getting User Details Page
  getuserlist: async (req, res) => {
    const user = await userModel.find().lean();
    res.render("UserList", { user });
  },
  // for user blocking
  blockuser: async (req, res) => {
    const uid = req.params.id;
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
    console.log(req.query);
    let username = req.query;
    let result = await userModel
      .find({ username: new RegExp(username, "i") })
      .lean();
    res.render("UserList", { result });
  },
  // for getting productlist page
  getproductlist: async (req, res) => {
    const product = await productModel.find().sort({ createdAt: -1 }).lean();

    res.render("productList", { product });
  },
  // for getting add product
  getaddProduct: async (req, res) => {
    const categorys = await categoryModel.find().lean();
    res.render("addProduct", { categorys });
  },
  // for posting add product
  postaddProduct: async (req, res) => {
    const { productname, price, brand, category, stock, description } =
      req.body;
    console.log(req.body);
    const product = await productModel.create(
      {
        productname,
        price,
        brand,
        category,
        stock,
        description,
        block: false,
        image: req.files.image[0],
        sideimage: req.files.sideimage,
      },

      res.redirect("/admin/product-list")
    );
    // await sharp(image.path)
    // .png()
    // .resize(540, 540, {
    //   kernel: sharp.kernel.nearest,
    //   fit: 'contain',
    //   position: 'center',
    //   background: { r: 255, g: 255, b: 255, alpha: 0 }
    // })
    // .toFile(image.path+".png")
    // .then(async () => {
    //   await unlinkAsync(image.path)
    //   image.path=image.path+".png"
    //   image.filename=image.filename+".png"
    //   console.log(image)
    // })
    // for (let i in sideImages) {
    //   await sharp(sideImages[i].path)
    //   .png()
    //   .resize(540, 540, {
    //     kernel: sharp.kernel.nearest,
    //     fit: 'contain',
    //     position: 'center',
    //     background: { r: 255, g: 255, b: 255, alpha: 0 }
    //   })
    //   .toFile(sideImages[i].path+".png")
    //   .then(async() => {
    //     await unlinkAsync(sideImages[i].path)
    //     sideImages[i].filename=sideImages[i].filename+".png"
    //     sideImages[i].path=sideImages[i].path+".png"
    //   });
    // }
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
    console.log(pid);
    await productModel.updateOne(
      { _id: pid },
      { $set: { block: true } },

      res.redirect("back")
    );
  },
  // for getting edit product
  geteditProduct: async (req, res) => {
    try {
      // var id = mongoose.Types.ObjectId(req.params.id);
      let id = req.params.id;

      const pro = await productModel.findOne({ _id: id }).lean();
      // console.log(pro);
      const result = await categoryModel.find().lean();

      res.render("editProduct", { pro, result });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/product-list");
    }
  },
  // for posting editproduct page
  posteditProduct: (req, res) => {
    const _id = req.params.id;
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
  },

  // for getting  category List page
  getcategory: async (req, res) => {
    let categorys = await categoryModel.find({}).lean();
    res.render("category", { categorys });
  },
  // for getting add category page
  getaddcategory: (req, res) => {
    res.render("addcategory", { error: false });
  },

  savecategory: async (req, res) => {
    try {
      const { category } = req.body;
      console.log(category);

      const categorys = await categoryModel.findOne({
        category: { $regex: new RegExp(category, "i") },
      });

      console.log(categorys);

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
    const uid = req.params.id;
    console.log(uid);
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
    const uid = req.params.id;
    console.log(uid);
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
    let order = await orderModel.find().lean();

    res.render("orderListinadmin", { order });
  },
  getcoupon: async (req, res) => {
    let coupons = await couponModel.find().sort({ _id: -1 }).lean();
    res.render("coupon", { coupons });
  },

  getaddcoupon: (req, res) => {
    res.render("addCoupon");
  },
  postaddcoupon: async (req, res) => {
    let block = false;
    const { name, code, minAmount, cashback, expiry } = req.body;
    console.log(req.body);
    const coupon = await couponModel.create(
      {
        name,
        code,
        minAmount,
        cashback,
        expiry,
        block,
      },

      res.redirect("/admin/coupons")
    );
  },

  geteditcoupon: async (req, res) => {
    try {
      const _id = req.params.id;
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
    console.log(req.body);

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
    const cid = req.params.id;

    await couponModel.updateOne(
      { _id: cid },
      { $set: { block: false } },

      res.redirect("back")
    );
  },
  listcoupon: async (req, res) => {
    const cid = req.params.id;
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
    let orderId = req.params.id;
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
    let orderId = req.params.id;
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
    let orderId = req.params.id;
    await orderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: "delivered",
        },
      }
    );
  },

  adminlogut: (req, res) => {
    req.session.admin = null;

    res.redirect("/admin/login");
  },
};
