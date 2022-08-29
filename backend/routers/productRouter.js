const express = require("express");
const { verifyAdmin, verifyUser } = require("../utils/verifyToken");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  productReview,
  deleteReview,
  getPrductReviews,
} = require("../controllers/productController");

router.get("/getallproducts", getAllProducts);

router.get("/getproductbyid/:id", getProductById);

router.get("/getproductreviews/:id", getPrductReviews);

router.post("/createproduct", verifyAdmin, createProduct);

router.put("/updateproduct/:id", verifyAdmin, updateProduct);

router.put("/productreview/:id", verifyUser, productReview);

router.delete("/deleteproduct/:id", verifyAdmin, deleteProduct);

router.delete("/deleteReview/:id", verifyUser, deleteReview);

module.exports = router;
