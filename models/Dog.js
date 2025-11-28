const mongoose = require("mongoose");

const DogSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        breed: { type: String },
        age: { type: Number },
        description: { type: String, required: true },
        imageUrl: { type: String },

        // "available" or "adopted"
        status: {
            type: String,
            enum: ["available", "adopted"],
            default: "available",
        },

        // Who registered the dog
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Who adopted the dog (if any)
        adoptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Thank-you / adoption message
        adoptionMessage: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Dog", DogSchema);
