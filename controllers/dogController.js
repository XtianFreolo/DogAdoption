const Dog = require("../models/Dog");

// Helper to extract user id safely from req.user
function getUserId(req) {
    return (
        req.user?.userId ||
        req.user?.id ||
        req.user?._id ||
        req.user // fallback if middleware sets it directly
    );
}

/**
 * POST /api/dogs
 * Register a new dog (current user becomes owner)
 */
exports.registerDog = async (req, res) => {
    try {
        const { name, breed, age, description, imageUrl } = req.body;

        if (!name || !description) {
            return res
                .status(400)
                .json({ message: "Name and description are required" });
        }

        const ownerId = getUserId(req);
        if (!ownerId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const dog = await Dog.create({
            name,
            breed,
            age,
            description,
            imageUrl,
            status: "available",
            owner: ownerId,
            adoptedBy: null,
            adoptionMessage: null,
        });

        return res.status(201).json(dog);
    } catch (err) {
        console.error("Error creating dog:", err);
        return res.status(500).json({ message: "Error creating dog" });
    }
};

/**
 * POST /api/dogs/:id/adopt
 * Adopt a dog by ID
 */
exports.adoptDog = async (req, res) => {
    try {
        const dogId = req.params.id;
        const { message } = req.body;
        const userId = getUserId(req);

        const dog = await Dog.findById(dogId);
        if (!dog) {
            return res.status(404).json({ message: "Dog not found" });
        }

        // Cannot adopt your own dog
        if (dog.owner && dog.owner.toString() === String(userId)) {
            return res
                .status(403)
                .json({ message: "You cannot adopt a dog you registered" });
        }

        // Cannot adopt if already adopted
        if (dog.status === "adopted") {
            return res
                .status(400)
                .json({ message: "Dog has already been adopted" });
        }

        dog.status = "adopted";
        dog.adoptedBy = userId;
        dog.adoptionMessage = message || null;

        await dog.save();

        return res.status(200).json(dog);
    } catch (err) {
        console.error("Error adopting dog:", err);
        return res.status(500).json({ message: "Error adopting dog" });
    }
};

/**
 * POST /api/dogs/:id/cancel-adoption
 * Cancel an adoption (only by the adopter). Dog goes back to "available".
 */
exports.cancelAdoption = async (req, res) => {
    try {
        const dogId = req.params.id;
        const userId = getUserId(req);

        const dog = await Dog.findById(dogId);
        if (!dog) {
            return res.status(404).json({ message: "Dog not found" });
        }

        // Must be currently adopted
        if (dog.status !== "adopted") {
            return res
                .status(400)
                .json({ message: "Dog is not currently adopted" });
        }

        // Only the adopter can cancel
        if (!dog.adoptedBy || dog.adoptedBy.toString() !== String(userId)) {
            return res
                .status(403)
                .json({ message: "You can only cancel dogs you adopted" });
        }

        dog.status = "available";
        dog.adoptedBy = null;
        dog.adoptionMessage = null;

        await dog.save();

        return res.status(200).json(dog);
    } catch (err) {
        console.error("Error canceling adoption:", err);
        return res.status(500).json({ message: "Error canceling adoption" });
    }
};

/**
 * DELETE /api/dogs/:id
 * Remove a dog (only owner, and only if not yet adopted)
 */
exports.removeDog = async (req, res) => {
    try {
        const dogId = req.params.id;
        const userId = getUserId(req);

        const dog = await Dog.findById(dogId);
        if (!dog) {
            return res.status(404).json({ message: "Dog not found" });
        }

        // Only owner can remove
        if (!dog.owner || dog.owner.toString() !== String(userId)) {
            return res
                .status(403)
                .json({ message: "You can only remove dogs you registered" });
        }

        // Cannot remove adopted dog
        if (dog.status === "adopted") {
            return res
                .status(400)
                .json({ message: "Cannot remove a dog that has already been adopted" });
        }

        await dog.deleteOne();
        return res.status(204).send();
    } catch (err) {
        console.error("Error removing dog:", err);
        return res.status(500).json({ message: "Error removing dog" });
    }
};

/**
 * GET /api/dogs/registered/me
 * List dogs registered by the current user (with optional status & pagination)
 */
exports.listRegisteredDogs = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { status, page = 1, limit = 10 } = req.query;

        const query = { owner: userId };
        if (status) {
            query.status = status; // "available" or "adopted"
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [dogs, total] = await Promise.all([
            Dog.find(query).skip(skip).limit(limitNum),
            Dog.countDocuments(query),
        ]);

        return res.json({
            data: dogs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("Error listing registered dogs:", err);
        return res.status(500).json({ message: "Error listing registered dogs" });
    }
};

/**
 * GET /api/dogs/adopted/me
 * List dogs adopted by the current user (with pagination)
 */
exports.listAdoptedDogs = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { page = 1, limit = 10 } = req.query;

        const query = { adoptedBy: userId };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [dogs, total] = await Promise.all([
            Dog.find(query).skip(skip).limit(limitNum),
            Dog.countDocuments(query),
        ]);

        return res.json({
            data: dogs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("Error listing adopted dogs:", err);
        return res.status(500).json({ message: "Error listing adopted dogs" });
    }
};

/**
 * GET /api/dogs
 * List ALL dogs on the platform (shared view, with optional status & pagination)
 */
exports.listAllDogs = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = {};
        if (status) {
            query.status = status; // "available" or "adopted"
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [dogs, total] = await Promise.all([
            Dog.find(query).skip(skip).limit(limitNum),
            Dog.countDocuments(query),
        ]);

        return res.json({
            data: dogs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("Error listing all dogs:", err);
        return res.status(500).json({ message: "Error listing dogs" });
    }
};
