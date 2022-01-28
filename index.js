const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth")

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb connected successfully"))
  .catch((err) => console.log(err.message));


app.get("/",(req, res)=>{
  res.send("<h2>Welcome to backend of Bank Auth</h2>")
})
app.use("/api/auth", authRoutes)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
