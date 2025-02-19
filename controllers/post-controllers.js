const cloudinary = require("../config/cloudinary")
const path = require("path")
const prisma = require("../models")
const fs = require("fs/promises")

module.exports.createPost = async (req, res, next) => {
  try {
    const { message } = req.body;
    const haveFile = Boolean(req.file)
    let uploadResult = {}
    if(haveFile) {
        uploadResult = await cloudinary.uploader.upload(req.file.path, {
          overwrite: true,
          public_id: path.parse(req.file.path).name,
        });
        fs.unlink(req.file.path)
    }

    // console.log(uploadResult)
    const data = {
        message : message,
        image : uploadResult.secure_url || "",
        userId : req.user.id
    }

    const rs = await prisma.post.create({data: data})
    
    res.status(201).json({ msg: "Create successful", result: rs });

  } catch (error) {
    next(error);
  }
};
module.exports.getAllPosts = async (req, res, next) => {
  try {
    res.json({ msg: "Get all Posts" });
  } catch (error) {
    next(error);
  }
};
module.exports.updatePost = async (req, res, next) => {
  try {
    res.json({ msg: "Update Post" });
  } catch (error) {
    next(error);
  }
};
module.exports.deletePost = async (req, res, next) => {
  try {
    res.json({ msg: "Delete Post" });
  } catch (error) {
    next(error);
  }
};
