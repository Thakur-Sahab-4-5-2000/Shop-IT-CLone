const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Login First");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    req.user = user;
    next();
  });
};

const verifyUser = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.send("Unauthorized User");
    }
  });
};

const verifyAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.send("Unauthorized User");
    }
  });
};

module.exports = { verifyToken, verifyUser, verifyAdmin };
