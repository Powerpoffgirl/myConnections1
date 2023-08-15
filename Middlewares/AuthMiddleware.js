const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
  // Get the JWT token from the request header
  // console.log("REQUEST TOKEN", req.token);
  const token = req.header('Authorization');
  console.log("TOKEN", token)

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const token = req.header('Authorization').split(' ')[1]; // Extract token from header
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request
    req.user = decoded;

    // User is authenticated, proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { isAuth };







// const isAuth = (req, res, next) => {
//   console.log('req',req)
//   console.log("REQUEST SESSION IN ISAUTH", req.session.isAuth);
//   console.log("REQUEST SESSION USER", req.session.user);

//     if (req.session.isAuth) {
//       // User is authenticated, proceed to the next middleware or route handler
//       next();
//     } else {
//       // User is not authenticated, pass an error to the error-handling middleware
//       next(new Error("Invalid Session, Please login Again"));
//     }
// };

// module.exports = { isAuth };
