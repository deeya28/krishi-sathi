const express = require("express");
const router = express.Router();

const {
  getUnverifiedExperts,
  getVerifiedExperts,
  verifyExpert,
  unverifyExpert,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All admin routes require the "admin" role
router.get("/experts/unverified", protect, authorize("admin"), getUnverifiedExperts);
router.get("/experts/verified", protect, authorize("admin"), getVerifiedExperts);
router.patch("/experts/:id/verify", protect, authorize("admin"), verifyExpert);
router.patch("/experts/:id/unverify", protect, authorize("admin"), unverifyExpert);

module.exports = router;