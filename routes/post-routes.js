const express = require("express")
const postRoute = express.Router()
const postController = require("../controllers/post-controllers")
const upload = require("../middlewares/upload")


postRoute.get("/", postController.getAllPosts)
postRoute.post("/", upload.single("image"), postController.createPost)
postRoute.put("/:id", upload.single("image"), postController.updatePost)
postRoute.delete("/:id", postController.deletePost)

module.exports = postRoute