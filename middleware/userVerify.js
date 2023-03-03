const verifyLogin = (req, res, next) => {
    if (req.session.userLoggedIn) {
      next();
    } else {
      res.redirect("/user-login");
    }
  }
  module.exports=verifyLogin