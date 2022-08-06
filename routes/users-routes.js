const express = require("express");

const userController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/:uid", userController.getStatsByUid);

router.post("/signup", userController.signup);

router.post("/login", userController.login);

module.exports = router;
