const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "must specify a description"],
    },

    price: {
      type: Number,
      required: [true, "please provide a price"],
    },
    details: { type: String },
    condition: {
      type: String,
      enum: ["new", "good as new", "used", "bad"],
      default: "good as new",
    },
    categorie: {
      type: String,
      enum: ["electronics", "games", "beauty", "cloths", "books", "sports"],
      required: [true, "please provide a categorie for this listing"],
    },
    seller: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    saves: { type: Number, default: 0 },
    stock: { type: Number, default: 1 },
    pictures: [
      { type: String, required: [true, "please add at least one image "] },
    ],

    createdAt: { type: Date, default: Date.now() },
    modifiedAt: { type: Date },
    rating: { type: Number, default: 0 },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

productSchema.pre("save", function (next) {
  this.modifiedAt = Date.now();
  next();
});

productSchema.pre("find", function (next) {
  this.populate("seller");
  next();
});

module.exports = mongoose.model("Products", productSchema);
