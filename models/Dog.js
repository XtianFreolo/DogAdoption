const mongoose = require("mongoose");

const DogSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        breed: { type: String },
        age: { type: Number },
        description: { type: String, required: true },
        imageUrl: { type: String },


        status: {
            type: String,
            enum: ["available", "adopted"],
            default: "available",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        adoptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        adoptionMessage: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Dog", DogSchema);
