const express = require("express");
const app = express();
const connectDB = require("./mongoDb");
const cors = require("cors");
const dotenv = require("dotenv");
const productRouter = require("./routers/productRouter");
const userRouter = require("./routers/userRouter");
const orderRouter = require("./routers/orderRouter");
const cookieParser = require("cookie-parser");

dotenv.config({ path: "./config/config.env" });
const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
