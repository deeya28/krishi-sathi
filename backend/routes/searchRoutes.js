const express = require("express");
const router = express.Router();

const { search } = require("../controllers/searchController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/search?q=keyword
router.get("/", protect, search);

module.exports = router;