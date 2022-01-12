const express = require("express");
const connectDB = require("./config/db");

const app = express();

//For connecting to DB
connectDB();

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello World !!");
});

//Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
