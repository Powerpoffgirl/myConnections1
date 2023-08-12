const isAuth = (req, res, next) => {
  console.log("REQUEST SESSION IN ISAUTH", req.session.isAuth);
  console.log("REQUEST SESSION USER", req.session.user);

  if (req.session.isAuth) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, pass an error to the error-handling middleware
    next(new Error("Invalid Session, Please login Again"));
  }
};

module.exports = { isAuth };
