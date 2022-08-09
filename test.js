const app = require("express")();
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/test.html");
});
app.listen("4001", () => {
  console.log("listening on port 4001...");
});
