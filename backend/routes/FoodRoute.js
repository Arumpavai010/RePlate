import express from "express";
import {createDonation,getDonations,claimDonation,EditDonation,getDonation,updateDonationStatus,rateDonation} from "../controller/FoodController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Role check middleware
const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Only ${role}s can perform this action` });
  }
  next();
};

// Routes
// Donors can create donations
router.post("/", authMiddleware, requireRole("donor"), createDonation);

// Anyone logged in can view all donations
router.get("/", getDonations);

// Logged in users can view a single donation
router.get("/:id", authMiddleware, getDonation);

// Donors can edit their own donations
router.put("/:id/edit", authMiddleware, requireRole("donor"), EditDonation);

// Receivers can claim donations
router.put("/:id/claim", authMiddleware, requireRole("receiver"), claimDonation);

// Receivers can update status of claimed donations
router.put("/:id/status", authMiddleware, requireRole("receiver"), updateDonationStatus);

// Rating which can be given by the receiver only
router.put("/:id/rating", authMiddleware, requireRole("receiver"), rateDonation);

export default router;