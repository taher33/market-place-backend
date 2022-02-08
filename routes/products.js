const express = require("express");
const router = express.Router();
const { protect, getUserAuth } = require("../controller/authController");
const {
  deletemany,
  getProducts,
  createProduct,
  singleProduct,
  searchProducts,
} = require("../controller/productController");

router
  .route("/")
  .get(getUserAuth, getProducts)
  .post(protect, createProduct)
  // .patch(protect, likePosts)
  .delete(deletemany);

router.route("/search").get(searchProducts);

router.route("/singleProduct").get(singleProduct);

module.exports = router;
