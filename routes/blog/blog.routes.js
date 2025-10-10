const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/blog/blog.controller");
const validate = require("../../middlewares/validate")
const validations = require("../../validations/blog/blog.validations")
const upload = require("../../middlewares/upload");

router
    .post("/",validate(validations.postBlogValidation),blogController.createBlog)
    .get("/", blogController.getBlog)
    .post("/summarize", blogController.summarize);

router
    .get("/:id", blogController.getBlogById)
    .patch("/:id", blogController.updateBlog)
    .delete("/:id", blogController.deleteBlog)
    .post("/:id/like", blogController.toggleLike)
    .get("/:id/comments", blogController.getComments)
    .post("/:id/comments", blogController.addComment);

module.exports = router;
