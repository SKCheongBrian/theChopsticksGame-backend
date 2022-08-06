const express = require("express");
const bodyParser = require("body-parser");

const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(usersRoutes);

app.listen(4000);
