class apiFeatures {
  constructor(query, queryStr, user) {
    this.query = query;
    this.queryStr = queryStr;
    this.user = user;
  }

  filter() {
    let newQuery = {
      ...this.queryStr,
    };
    const exclude = ["sort", "page", "limit", "fields", "price", "rating"];
    exclude.forEach((el) => delete newQuery[el]);
    this.query = this.query.find(newQuery);
    // if (!newQuery.user && this.user.People_I_follow.length !== 0) {
    //   this.query = this.query.find({ user: this.user.following });
    // }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(".").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  GetPriceAndRating() {
    if (this.queryStr.price) {
      const [sign, price] = this.queryStr.price.split(".");
      if (sign === "gt") this.query.find({ price: { $gte: price * 1 } });
      if (sign === "lt") this.query.find({ price: { $lte: price * 1 } });
      if (sign === "eq") this.query.find({ price });
    }
    if (this.queryStr.rating) {
      const [sign, rating] = this.queryStr.price.split(".");
      if (sign === "gt") this.query.find({ rating: { $gte: rating * 1 } });
      if (sign === "lt") this.query.find({ rating: { $lte: rating * 1 } });
      if (sign === "eq") this.query.find({ rating });
    }

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(".").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;

    let skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit + 1);
    return this;
  }
}

module.exports = apiFeatures;
