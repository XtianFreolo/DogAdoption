const mongoose = require("mongoose");

const DogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    adoptedMessage: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Dog", DogSchema);
