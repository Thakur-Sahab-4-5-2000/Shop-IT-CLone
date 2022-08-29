const orderSchema = require("../models/orderModel");
const productSchema = require("../models/productModel");

const newOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      city,
      country,
      pinCode,
      phoneNo,
      state,
      totalPrice,
    } = req.body;

    const order = await new orderSchema({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      city,
      country,
      pinCode,
      phoneNo,
      state,
      totalPrice,
      paidAt: Date.now(),
      user: req.user.id,
    });
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const order = await orderSchema
      .findById(req.params.id)
      .populate("user", "name email");
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await orderSchema.find({ user: req.user.id });
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json(e);
  }
};

const getAllOrderAdmin = async (req, res) => {
  try {
    const orders = await orderSchema.find();
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
    res.status(200).json({ totalAmount, orders });
  } catch (e) {
    res.status(400).json(e);
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await orderSchema.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }
    if (order.orderStatus === "Delivered") {
      return res
        .status(200)
        .json({ error: "You have already delivered this order" });
    }
    order.orderItems.forEach(async (item) => {
      console.log(item.name);
      await updateStock(res, item.productID, item.quantity);
    });
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

const updateStock = async (res, productID, quantity) => {
  const product = await productSchema.findById(productID);
  if (!product) {
    return res.status(400).json({ error: "Product not found" });
  }
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
};

const deleteOder = async (req, res) => {
  try {
    const Order = await orderSchema.findById(req.params.id);
    await Order.remove();
    res.status(200).json({ message: "Order is deleted" });
  } catch (e) {
    res.status(400).json(e);
  }
};

module.exports = {
  newOrder,
  getSingleOrder,
  getUserOrders,
  getAllOrderAdmin,
  updateOrder,
  deleteOder,
};
