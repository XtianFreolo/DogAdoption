const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const dogController = require("../controllers/dogController");

// GET /api/dogs
// List ALL dogs on the platform (shared view)
router.get("/", auth, dogController.listAllDogs);

// POST /api/dogs
// Register a new dog (current user becomes owner)
router.post("/", auth, dogController.registerDog);

// POST /api/dogs/:id/adopt
// Adopt a dog by ID
router.post("/:id/adopt", auth, dogController.adoptDog);

// POST /api/dogs/:id/cancel-adoption
// Cancel an adoption (only by adopter)
router.post("/:id/cancel-adoption", auth, dogController.cancelAdoption);

// DELETE /api/dogs/:id
// Remove a dog (only owner, only if not adopted)
router.delete("/:id", auth, dogController.removeDog);

// GET /api/dogs/registered/me
// List dogs registered by the current user
router.get("/registered/me", auth, dogController.listRegisteredDogs);

// GET /api/dogs/adopted/me
// List dogs adopted by the current user
router.get("/adopted/me", auth, dogController.listAdoptedDogs);

module.exports = router;
