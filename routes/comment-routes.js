const express = require("express");
const commentRoute = express.Router();
const commentController = require("../controllers/comment-controllers");

commentRoute.post("/", commentController.createComment);

module.exports = commentRoute;
