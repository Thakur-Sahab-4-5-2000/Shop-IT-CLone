const productSchema = require("../models/productModel");
const ApiFeatures = require("../utils/apifeatures");
const userSchema = require("../models/userModel");

const createProduct = async (req, res) => {
  req.body.user = req.user.id;
  try {
    const newProd = await new productSchema(req.body);
    const prodSave = await newProd.save();
    res.status(200).json(prodSave);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getAllProducts = async (req, res) => {
  const perPageItem = 8;
  try {
    const products = new ApiFeatures(productSchema.find(), req.query)
      .search()
      .filter()
      .pagination(perPageItem);
    const prod = await products.query;
    const productsCount = await productSchema.countDocuments();
    res.status(200).json({ prod, productsCount });
  } catch (err) {
    res.status(400).send(err);
  }
};

const getProductById = async (req, res) => {
  try {
    const prod = await productSchema.findById(req.params.id);
    if (!prod) {
      return res.status(400).send("Product not found");
    }
    res.status(200).json(prod);
  } catch (err) {
    res.status(400).send(err);
  }
};

const updateProduct = async (req, res) => {
  try {
    const prod = await productSchema.findById(req.params.id);
    if (!prod) {
      return res.status(400).send("Product not found");
    }
    const ans = await productSchema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json(ans);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const prod = await productSchema.findById(req.params.id);
    if (!prod) {
      return res.status(400).send("Product not found");
    }
    await productSchema.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(400).send(err);
  }
};

const productReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const { name, id } = await userSchema.findById(req.user.id);

    const review = {
      user: id,
      name,
      rating: Number(rating),
      comment,
    };

    const product = await productSchema.findById(productId);

    if (!product) {
      res.status(404).send("Product not found");
    }

    const isReviewed = await product.reviews.find(
      (rev) => rev.user.toString() === id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === id.toString()) {
          (rev.rating = rating), (rev.comment = comment);
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Review added" });
  } catch (err) {
    res.status(400).send(err);
  }
};

const getReviews = async (req, res) => {
  try {
    const product = await productSchema.findById(req.params.id);
    if (!product) {
      res.status(404).send("Product not found");
    }
    res.status(200).json(product.reviews);
  } catch (e) {
    res.status(400).send(e);
  }
};

const deleteReview = async (req, res) => {
  try {
    const product = await productSchema.findById(req.query.prodID);
    if (!product) {
      res.status(404).send("Product not found");
    }
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.reviewId.toString()
    );
    const numOfReviews = reviews.length;
    let ratings = 0;
    reviews.forEach((rev) => {
      ratings += rev.rating;
    });
    ratings = ratings / reviews.length;
    await productSchema.findByIdAndUpdate(
      req.query.prodID,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({ message: "Review deleted" });
  } catch (e) {
    res.status(400).send(e);
  }
};

const getPrductReviews = async (req, res) => {
  try {
    const product = await productSchema.findById(req.params.id);
    if (!product) {
      res.status(404).send("Product not found");
    }
    res.status(200).json(product.reviews);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  productReview,
  deleteReview,
  getPrductReviews,
};
