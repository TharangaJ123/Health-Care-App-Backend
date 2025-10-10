const express = require('express');
const router = express.Router();
const controller = require('../../controllers/users/user.controller');

router.get('/', controller.getUsers);
router.get('/:id', controller.getUserById);

module.exports = router;
