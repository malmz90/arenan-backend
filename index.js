const express = require("express");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const app = express();
const cookieParser = require("cookie-parser");

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Import route modules
const authRoutes = require("./routes/authRoutes");
const characterRoutes = require("./routes/characterRoutes");
const itemRoutes = require("./routes/itemRoutes");

// Use route modules
app.use("/auth", authRoutes);
app.use("/character", characterRoutes);
app.use("/item", itemRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
