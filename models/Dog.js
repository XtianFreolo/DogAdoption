
const mongoose = require("mongoose");

// Dogs
class DogClass {

    isPuppy() {
        return this.age < 1;
    }


    getInfo() {
        return `${this.name} is a ${this.breed}, age ${this.age}`;
    }


    canAdopt() {
        return this.isAvailable;
    }
}


const DogSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        breed: { type: String, required: true },
        age: { type: Number, required: true },
        description: { type: String },
        imageUrl: { type: String },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);


DogSchema.loadClass(DogClass);


module.exports = mongoose.model("Dog", DogSchema);
