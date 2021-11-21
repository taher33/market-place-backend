const handleasync = require("../utils/handleAsync");
const appError = require("../utils/appError");

exports.deleteOne = Model =>
  handleasync(async (req, res, next) => {
    const id = req.body.id || req.params.postId;
    await Model.findByIdAndDelete(id);
    if (!Model) return next(new appError("not found the model", 404));
    res.status(204).json({
      status: "success",
    });
  });
