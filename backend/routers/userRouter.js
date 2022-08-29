const express = require("express");
const router = express.Router();
const {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPasswordUrl,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  deleteProfile,
  deleteUser,
  updateUserRole,
} = require("../controllers/userController");
const { body } = require("express-validator");
const { verifyUser, verifyAdmin } = require("../utils/verifyToken");

router.post(
  "/registerUser",
  [
    body("name", "Please enter your name").isLength({ min: 4 }),
    body("email", "Please enter a vaild email address").isEmail(),
    body("password", "Please enter your password").isLength({ min: 5 }),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email", "Please enter a vaild email address").isEmail(),
    body("password", "Please enter your password").isLength({ min: 5 }),
  ],
  login
);
router.get("/logout", logout);

router.post(
  "/forgotPassword",
  [body("email", "Please enter a vaild email address").isEmail()],
  forgotPassword
);

router.put(
  "/resetPassword/:token",
  [
    body("password", "Please enter your password").isLength({ min: 5 }),
    body(
      "confirmPassword",
      "Plaase enter same password as filled above"
    ).isLength({ min: 5 }),
  ],
  resetPasswordUrl
);

router.get("/getUserDetails", verifyUser, getUserDetails);

router.put(
  "/updatePassword",
  verifyUser,
  [
    body(
      "password",
      "Please enter your password of min length 5 characters"
    ).isLength({
      min: 5,
    }),
    body(
      "newPassword",
      "Please enter your password of min length 5 characters"
    ).isLength({
      min: 5,
    }),
    body(
      "confirmPassword",
      "Plaase enter same password as filled above"
    ).isLength({ min: 5 }),
  ],
  updatePassword
);

router.put("/updateProfile/:id", verifyUser, updateProfile);

router.get("/getAllUsers", verifyAdmin, getAllUsers);

router.get("/getSingleUser/:id", verifyAdmin, getSingleUser);

router.put("/updateUserRole/:id", verifyAdmin, updateUserRole);

router.delete("/deleteProfile/:id", verifyUser, deleteProfile);

router.delete("/deleteUser/:id", verifyAdmin, deleteUser);

module.exports = router;
