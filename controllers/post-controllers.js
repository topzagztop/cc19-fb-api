const cloudinary = require("../config/cloudinary");
const path = require("path");
const prisma = require("../models");
const fs = require("fs/promises");
const createError = require("../utils/createError");

module.exports.createPost = async (req, res, next) => {
  try {
    const { message } = req.body;
    const haveFile = Boolean(req.file);
    let uploadResult = {};
    if (haveFile) {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path);
    }

    // console.log(uploadResult)
    const data = {
      message: message,
      image: uploadResult.secure_url || "",
      userId: req.user.id,
    };

    const rs = await prisma.post.create({ data: data });

    res.status(201).json({ msg: "Create successful", result: rs });
  } catch (error) {
    next(error);
  }
};
module.exports.getAllPosts = async (req, res, next) => {
  try {
    const rs = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        comments: {
          // select: {message: true,},
          include : {
            user : {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              }
            }
          }
        },
        likes : {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              }
            }
          }
        }
      },
    });
    res.json({ posts: rs });
  } catch (error) {
    next(error);
  }
};
module.exports.updatePost = async (req, res, next) => {
  try {
    const {id} = req.params
    const {message, removePic} = req.body

    const postData = await prisma.post.findUnique({
      where: {
        id: Number(id)
      }
    })

    if(!postData || req.user.id !== postData.userId)  {
      return createError(400, "Cannot edit this post")
    }

    const haveFile = !!req.file
    // let uploadResult = {};
    if (haveFile) {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path);
    }

    let data = haveFile
      ? {
          message: message,
          image: uploadResult.secure_url,
          userId: req.user.id,
        }
      : {
          message: message,
          userId: req.user.id,
          image: removePic ? "" : postData.image,
        };
    
    const rs = await prisma.post.update({
      where: {
        id: Number(id)
      },
      data : data
    })

    res.json({ msg: "Update Post" });
  } catch (error) {
    next(error);
  }
};
module.exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const postData = await prisma.post.findUnique({
      where: {
        id: Number(id)
      }
    })

    // console.log(postData)

    if(req.user.id !== postData.userId) {
      return createError(400, "Cannot delete")
    }

    const rs = await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ msg: `Delete Done id: ${postData.id} | ${postData.message}` ,deletePost: postData });
  } catch (error) {
    next(error);
  }
};
