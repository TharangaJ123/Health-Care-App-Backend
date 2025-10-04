const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/blog/blog.controller");
const validate = require("../../middlewares/validate")
const validations = require("../../validations/blog/blog.validations")

router
    .post("/",validate(validations.postBlogValidation),blogController.createBlog)
    .get("/", blogController.getBlog);

router
    .get("/:id", blogController.getBlogById)
    .patch("/:id", blogController.updateBlog)
    .delete("/:id", blogController.deleteBlog);

module.exports = router;
