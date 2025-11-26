const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
const authRoutes = require("./routes/auth");
const dogRoutes = require("./routes/dogs");

app.use("/api/auth", authRoutes);
app.use("/api/dogs", dogRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // helpful for mocha tests later
