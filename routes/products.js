const express = require("express");
const router = express.Router();
const { protect } = require("../controller/authController");
const {
  deletemany,
  getProducts,
  createProduct,
  singleProduct,
} = require("../controller/productController");

router
  .route("/")
  .get(getProducts)
  .post(protect, createProduct)
  // .patch(protect, likePosts)
  .delete(deletemany);

router.route("/singleProduct").get(singleProduct);

module.exports = router;
