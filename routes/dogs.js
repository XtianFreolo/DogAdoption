const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const dogController = require("../controllers/dogController");


router.post("/", auth, dogController.registerDog);


router.post("/:id/adopt", auth, dogController.adoptDog);


router.delete("/:id", auth, dogController.removeDog);


router.get("/registered/me", auth, dogController.listRegisteredDogs);


router.get("/adopted/me", auth, dogController.listAdoptedDogs);

module.exports = router;
