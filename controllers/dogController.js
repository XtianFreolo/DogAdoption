const Dog = require("../models/Dog");

exports.createDog = async (req, res) => {
    try {
        const { name, breed, age, description, imageUrl } = req.body;

        const dog = await Dog.create({
            name,
            breed,
            age,
            description,
            imageUrl
        });

        res.status(201).json(dog);
    } catch (err) {
        res.status(500).json({ message: "Error creating dog" });
    }
};
