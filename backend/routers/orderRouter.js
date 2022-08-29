const express = require("express");
const router = express.Router();
const {
  newOrder,
  getSingleOrder,
  getUserOrders,
  getAllOrderAdmin,
  updateOrder,
  deleteOder,
} = require("../controllers/orderControllers");
const { verifyUser, verifyAdmin } = require("../utils/verifyToken");

router.get("/myOrder", verifyUser, getUserOrders);

router.get("/getallorders", verifyAdmin, getAllOrderAdmin);

router.get("/:id", verifyAdmin, getSingleOrder);

router.post("/new", verifyUser, newOrder);

router.put("/update/:id", verifyAdmin, updateOrder);

router.delete("/deleteOrder/:id", verifyAdmin, deleteOder);

module.exports = router;
