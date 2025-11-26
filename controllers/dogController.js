const Dog = require("../models/Dog");


exports.registerDog = async (req, res) => {
    try {
        const { name, breed, age, description, imageUrl } = req.body;

        if (!name || !description) {
            return res
                .status(400)
                .json({ message: "Name and description are required" });
        }

        const dog = await Dog.create({
            name,
            breed,
            age,
            description,
            imageUrl,
            owner: req.user._id,
        });

        res.status(201).json(dog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating dog" });
    }
};


exports.adoptDog = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        const dog = await Dog.findById(id);
        if (!dog) return res.status(404).json({ message: "Dog not found" });


        if (dog.status === "adopted") {
            return res
                .status(400)
                .json({ message: "Dog has already been adopted" });
        }


        if (dog.owner.toString() === req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "You cannot adopt a dog you registered" });
        }

        dog.status = "adopted";
        dog.adoptedBy = req.user._id;
        dog.adoptionMessage = message || null;

        await dog.save();

        res.json(dog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error adopting dog" });
    }
};


exports.removeDog = async (req, res) => {
    try {
        const { id } = req.params;

        const dog = await Dog.findById(id);
        if (!dog) return res.status(404).json({ message: "Dog not found" });


        if (dog.owner.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "You can only remove dogs you registered" });
        }


        if (dog.status === "adopted") {
            return res
                .status(400)
                .json({ message: "Cannot remove a dog that has already been adopted" });
        }

        await dog.deleteOne();

        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error removing dog" });
    }
};


exports.listRegisteredDogs = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { owner: req.user._id };
        if (status) {
            query.status = status;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [dogs, total] = await Promise.all([
            Dog.find(query).skip(skip).limit(limitNum),
            Dog.countDocuments(query),
        ]);

        res.json({
            data: dogs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error listing registered dogs" });
    }
};


exports.listAdoptedDogs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = { adoptedBy: req.user._id };

        const [dogs, total] = await Promise.all([
            Dog.find(query).skip(skip).limit(limitNum),
            Dog.countDocuments(query),
        ]);

        res.json({
            data: dogs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error listing adopted dogs" });
    }
};
