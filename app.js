

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();


app.use(cors());
app.use(express.json());


connectDB();


app.get("/", (req, res) => {
    res.send("Dog Adoption API is running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
