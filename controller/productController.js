const handleasync = require("../utils/handleAsync");
const apiFeatures = require("../utils/api-features");
const Products = require("../models/productM");
const appError = require("../utils/appError");
const { deleteOne } = require("./handlerFactory");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getProducts = handleasync(async (req, res, next) => {
  const feature = new apiFeatures(Products.find(), req.query, req.user)
    .filter()
    .limitFields()
    .sort()
    .GetPriceAndRating()
    .pagination()
    .limitToFollowings();
  const products = await feature.query;

  //haseMore for pagination in the frontend
  let haseMore = false;
  if (products.length === 11) {
    haseMore = true;
    products.pop();
  }

  res.json({
    res: products.length,
    products,
    haseMore,
  });
});

exports.createProduct = handleasync(async (req, res, next) => {
  const picture = req.files.picture;
  let files = [];
  if (!picture[0]) {
    const uploadResult = await cloudinary.v2.uploader.upload(
      picture.tempFilePath
    );
    files.push(uploadResult.secure_url);
  } else {
    let promises = await picture.map(async (pic) => {
      const uploadResult = await cloudinary.v2.uploader.upload(
        pic.tempFilePath
      );

      return uploadResult.secure_url;
    });
    files = await Promise.all(promises);
  }

  const newproduct = await Products.create({
    description: req.body.description,
    title: req.body.title,
    seller: req.user._id,
    price: req.body.price,
    pictures: files,
    categorie: req.body.categorie,
    condition: req.body.condition,
  });

  const product = await Products.findById(newproduct._id).populate("seller");

  res.status(201).json({
    status: "success",
    product,
  });
});

exports.singleProduct = handleasync(async (req, res, next) => {
  const product = await Products.find(req.query);
  if (!product) return next(new appError(404, "not found"));

  res.json({
    product: product[0],
  });
});
// did not add the end point yet
exports.likeProducts = handleasync(async (req, res, next) => {
  // should decide if params or body
  if (!req.body.productId)
    return next(new appError("the product id is required", 400));

  const product = await Products.findById(req.body.productId);

  if (!product) return next(new appError("product not found", 404));

  const index = product.likes.indexOf(req.user._id);
  if (index === -1) {
    product.likes.push(req.user._id);
  } else {
    product.likes.splice(index, 1);
  }
  product.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
  });
});

exports.deleteProducts = deleteOne(Products);
// for testing
exports.deletemany = async (req, res, next) => {
  await Products.deleteMany();
  res.status(204);
};
// restrict some actions to some users
// still needs testing
exports.restrict = (req, res, next) => {
  const id = req.params.productId || req.body.id;

  if (req.user._id === id) next();
  else return next(new appError("not auth for this action", 403));
};
