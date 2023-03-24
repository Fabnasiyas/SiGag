const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const adminModel = require("../models/adminModel");
const couponModel = require("../models/couponModel");
const bannerModel = require("../models/bannerModel");
var mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const { truncate } = require("fs");
const sanitizer = require("sanitizer");
const sharp = require("sharp");

module.exports = {
  // for getting Admin Login Page
  getadminLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect('/admin/')
    } else {
      res.render("adminloginPage");
    }
  },
  // for posting Admin Login Page

  postadminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      let admin = await adminModel.findOne({ email });
      if (admin) {
        if (password == admin.password) {
          req.session.admin = {
            name: admin.name,
          };
          res.redirect("/admin/");
        } else {
          console.log("Invalid password");
          res.redirect("back");
        }
      } else {
        console.log("Admin not found");
        res.redirect("back");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },

  // for getting Admin Dashbord
  adminHome: async (req, res) => {
    if (req.session.admin) {
      try {
        const orderCount = await orderModel.countDocuments().lean();
        const deliveredOrders = await orderModel
          .find({ orderStatus: "delivered" })
          .lean();
        let totalRevenue = 0;
        let Orders = await Promise.all(
          deliveredOrders.map(async (item) => {
            totalRevenue = totalRevenue + item.totalPrice;
            return item;
          })
        );
        const monthlyDataArray = await orderModel.aggregate([
          { $match: { orderStatus: "delivered" } },

          {
            $group: {
              _id: { $month: "$orderDate" },
              sum: { $sum: "$totalPrice" },
            },
          },
        ]);

        const monthlyReturnArray = await orderModel.aggregate([
          {
            $match: { orderStatus: "Return" },
          },
          {
            $group: {
              _id: { $month: "$orderDate" },
              sum: { $sum: "$totalPrice" },
            },
          },
        ]);
        let monthlyDataObject = {};
        let monthlyReturnObject = {};
        monthlyDataArray.map((item) => {
          monthlyDataObject[item._id] = item.sum;
        });
        monthlyReturnArray.map((item) => {
          monthlyReturnObject[item._id] = item.sum;
        });
        let monthlyReturn = [];
        for (let i = 1; i <= 12; i++) {
          monthlyReturn[i - 1] = monthlyReturnObject[i] ?? 0;
        }
        let monthlyData = [];
        for (let i = 1; i <= 12; i++) {
          monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
        }
        const online = await orderModel
          .find({ payment: "online" })
          .countDocuments()
          .lean();
        const cod = await orderModel
          .find({ payment: "cod" })
          .countDocuments()
          .lean();
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
        console.log(error);
      }

      // res.render("dashboard");
    } else {
      res.redirect("/admin/login");
    }
  },

  getuserlist: async (req, res) => {
    try {
      const user = await userModel.find().sort({ _id: -1 }).lean();
      res.render("UserList", { user });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },

  getbanner: async (req, res) => {
    try {
      const banner = await bannerModel.find().lean();
      res.render("Banner", { banner });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },
  getaddbanner: (req, res) => {
    res.render("addbanner");
  },
  postaddbanner: async (req, res) => {
    try {
      await bannerModel.create({
        name: req.body.name,
        image: req.files.image,
      });
      res.redirect("/admin/banner");
    } catch (error) {
      res.redirect("/404");
    }
  },
  deletebanner: async (req, res) => {
    try {
      // const bannerId = req.params.id;
      let bannerId = sanitizer.sanitize(req.params.id);
      await bannerModel.deleteOne({ _id: bannerId });
      res.redirect("/admin/banner");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
  // for user blocking
  blockuser: async (req, res) => {
    try {
      const uid = sanitizer.sanitize(req.params.id);
      await userModel.findByIdAndUpdate(
        { _id: uid },
        { $set: { block: true } }
      );
      res.redirect("/admin/user-list");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },
  // for user unblocking
  unblockuser: async (req, res) => {
    try {
      const uid = req.params.id;
      await userModel.findByIdAndUpdate(
        { _id: uid },
        { $set: { block: false } }
      );
      res.redirect("/admin/user-list");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },
  getsearchuser: async (req, res) => {
    try {
      let query = req.body.name;
      let user = await userModel
        .find({ $or: [{ name: new RegExp(query, "i") }, { email: query }] })
        .lean();
      res.render("UserList", { user });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while searching for user");
    }
  },
  searchproduct: async (req, res) => {
    try {
      let prod = req.body.name;
      let product = await productModel
        .find({ productname: new RegExp(prod, "i") })
        .lean();
      res.render("productList", { product });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while searching for coupon");
    }
  },
  couponsearch: async (req, res) => {
    try {
      let coupon = req.body.name;
      let coupons = await couponModel
        .find({ name: new RegExp(coupon, "i") })
        .lean();
      res.render("coupon", { coupons });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while searching for products");
    }
  },
  // for getting productlist page
  getproductlist: async (req, res) => {
    try {
      const product = await productModel.find().sort({ createdAt: -1 }).lean();
      res.render("productList", { product });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },
  // for getting add product
  getaddProduct: async (req, res) => {
    try {
      const categorys = await categoryModel.find().sort({ _id: -1 }).lean();
      res.render("addProduct", { categorys });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },

  postaddProduct: async (req, res) => {
    try {
      const { productname, price, brand, category, stock, description } =
        req.body;
      const image = req.files.image[0];
      const sideimage = req.files.sideimage;

      await sharp(image.path)
        .png()
        .resize(300, 300, {
          kernel: sharp.kernel.nearest,
          fit: "contain",
          position: "center",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toFile(image.path + ".png");

      image.filename = image.filename + ".png";
      image.path = image.path + ".png";

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
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add-product");
    }
  },

  unlistProduct: async (req, res) => {
    try {
      const pid = req.params.id;
      await productModel.updateOne({ _id: pid }, { $set: { block: false } });
      res.redirect("back");
    } catch (error) {
      console.error(error);
      res.redirect("back");
    }
  },

  listProduct: async (req, res) => {
    try {
      const pid = req.params.id;
      await productModel.updateOne({ _id: pid }, { $set: { block: true } });
      res.redirect("back");
    } catch (error) {
      console.error(error);
      res.redirect("back");
    }
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

  posteditProduct: async (req, res) => {
    try {
      const _id = sanitizer.sanitize(req.params.id);
      const { productname, price, brand, category, stock, description } =
        req.body;

      let updateObject = {
        productname,
        price,
        brand,
        category,
        stock,
        description,
      };

      if (req.files.image && req.files.sideimage) {
        updateObject.image = req.files.image[0];
        updateObject.sideimage = req.files.sideimage;
      } else if (req.files.image) {
        updateObject.image = req.files.image[0];
      } else if (req.files.sideimage) {
        updateObject.sideimage = req.files.sideimage;
      }

      const updatedProduct = await productModel.findByIdAndUpdate(_id, {
        $set: updateObject,
      });

      if (!updatedProduct) {
        res.redirect("back");
      } else {
        res.redirect("/admin/product-list");
      }
    } catch (err) {
      console.error(err);
      res.redirect("back");
    }
  },

  getcategory: async (req, res) => {
    try {
      const categorys = await categoryModel.find({}).sort({ _id: -1 }).lean();
      res.render("category", { categorys });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  // for getting add category page
  getaddcategory: (req, res) => {
    try {
      res.render("addcategory", { error: false });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
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
    try {
      let uid = sanitizer.sanitize(req.params.id);
      await categoryModel.findByIdAndUpdate(
        { _id: uid },
        { $set: { block: true } }
      );
      res.redirect("/admin/category-list");
    } catch (error) {
      res.redirect("/admin/category-list");
    }
  },

  // for unblocking a category
  unblockcategory: async (req, res) => {
    try {
      let uid = sanitizer.sanitize(req.params.id);
      await categoryModel.findByIdAndUpdate(
        { _id: uid },
        { $set: { block: false } }
      );
      res.redirect("/admin/category-list");
    } catch (error) {
      console.error(error);
      res.redirect("/admin/category-list");
    }
  },

  // for getting order list page
  getorderlist: async (req, res) => {
    try {
      let order = await orderModel.find().sort({ _id: -1 }).lean();
      for (const i of order) {
        i.orderDate = new Date(i.orderDate).toDateString();
      }

      res.render("orderListinadmin", { order });
    } catch (error) {
      console.error(error);
      res.redirect("back");
    }
  },
  getcoupon: async (req, res) => {
    try {
      let coupons = await couponModel.find().sort({ _id: -1 }).lean();
      if (coupons) {
        for (const i of coupons) {
          i.expiry = i.expiry.toLocaleDateString();
        }
      }
      res.render("coupon", { coupons });
    } catch (error) {
      console.error(error);
      res.redirect("back");
    }
  },

  getaddcoupon: (req, res) => {
    res.render("addCoupon");
  },

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
        return res.render("addcoupon", {
          derror: "Expiry date cannot be before today's date",
        });
      }

      const dateParts = expiry.split("/");
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
    try {
      let orderId = sanitizer.sanitize(req.params.id);
      await couponModel.updateOne({ _id: orderId }, { $set: { block: false } });
      res.redirect("back");
    } catch (err) {
      console.error(err);
      res.redirect("/admin/coupon");
    }
  },

  listcoupon: async (req, res) => {
    try {
      let orderId = sanitizer.sanitize(req.params.id);
      await couponModel.updateOne({ _id: orderId }, { $set: { block: true } });
      res.redirect("back");
    } catch (err) {
      console.error(err);
      res.redirect("/admin/coupon");
    }
  },

  getorderpending: async (req, res) => {
    try {
      let orderId = req.params.id;
      await orderModel.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "pending",
          },
        }
      );
      res.redirect("/admin/order-list");
    } catch (err) {
      console.error(err);
      res.redirect("/admin/order-list");
    }
  },

  getordercancel: async (req, res) => {
    try {
      let orderId = sanitizer.sanitize(req.params.id);
      await orderModel.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "canceled",
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/order-list");
    }
  },

  getordershipped: async (req, res) => {
    try {
      let orderId = sanitizer.sanitize(req.params.id);
      await orderModel.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "shipped",
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/order-list");
    }
  },

  getorderdelivered: async (req, res) => {
    try {
      let orderId = sanitizer.sanitize(req.params.id);
      await orderModel.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "delivered",
            deliveryDate: new Date(),
            returnstatus: true,
            cancel: true,
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/order-list");
    }
  },

  getorderreturn: async (req, res) => {
    try {
      let orderId = sanitizer.sanitize(req.params.id);
      await orderModel.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "Return",
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/order-list");
    }
  },

  getsalesreport: async (req, res) => {
    try {
      let orders;
      let deliveredOrders;
      let salesCount;
      let salesSum;
      let result;
      let start = new Date(new Date().setDate(new Date().getDate() - 8));
      let end = new Date();
      let filter = req.query.filter ?? "";

      if (req.query.start) start = new Date(req.query.start);
      if (req.query.end) end = new Date(req.query.end);

      if (req.query.start) {
        start.setHours(0, 0, 0, 0)
        end.setHours(24, 0, 0, 0)
        orders = await orderModel
          .find({ orderDate: { $gte: start, $lte: end } })
          .lean();
        deliveredOrders = orders.filter(
          (order) => order.orderStatus === "delivered"
        );
        salesCount = await orderModel.countDocuments({
          orderDate: { $gte: start, $lte: end },
          orderStatus: "delivered",
        });
        salesSum = deliveredOrders.reduce(
          (acc, order) => acc + order.totalPrice,
          0
        );
      } else {
        deliveredOrders = await orderModel
          .find({ orderStatus: "delivered" })
          .sort({ orderDate: -1 })
          .lean();

        for (const i of deliveredOrders) {
          i.orderDate = new Date(i.orderDate).toDateString();
        }

        salesCount = await orderModel.countDocuments({
          orderStatus: "delivered",
        });

        result = await orderModel.aggregate([
          { $match: { orderStatus: "delivered" } },
          { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } },
        ]);
        salesSum = result[0]?.totalPrice;
      }

      const users = await orderModel.distinct("userId");
      const userCount = users.length;
      if (Object.keys(req.query).length == 0) {
        res.render("salesreport", {
          userCount,
          salesCount,
          salesSum,
          deliveredOrders,
        });
      } else {
        res.json({ userCount, salesCount, deliveredOrders });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },

  adminlogut: (req, res) => {
    req.session.admin = null;

    res.redirect("/admin/login");
  },
};
