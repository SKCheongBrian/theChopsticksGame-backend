const express = require("express");

const router = express.Router();

router.get("/users", (req, res, next) => {
  console.log("GET request at users");
  res.json({ status: "success", message: "this works!" });
});

module.exports = router;
