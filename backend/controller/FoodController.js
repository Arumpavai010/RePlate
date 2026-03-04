import Donation from "../models/FoodModel.js";

// Helper to safely parse numbers
const parseNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

// ✅ Donor creates a donation
export const createDonation = async (req, res) => {
  try {
    const lat = parseNumber(req.body.lat);
    const lon = parseNumber(req.body.lon);

    let location = req.body.location;
    if (location && location.toLowerCase().includes("lat")) {
      location = null;
    }

    const donation = new Donation({
      ...req.body,
      donorId: req.user._id,
      location,
      lat,
      lon,
      status: "Pending"
    });

    await donation.save();
    const populated = await donation.populate("donorId", "username");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Only receivers can claim donations
export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.receiverId) return res.status(400).json({ message: "Already claimed" });

    donation.receiverId = req.user._id;
    donation.claimedBy = req.user._id;
    donation.status = "Requested";
    await donation.save();

    // ✅ Re-query with populate
    const populated = await Donation.findById(donation._id)
      .populate("donorId", "username")
      .populate("receiverId", "username");

    return res.status(200).json({
      message: "Donation claimed successfully",
      donation: populated
    });
  } catch (error) {
    console.error("Error in claimDonation:", error);
    return res.status(500).json({ message: "Server error while claiming donation" });
  }
};
// ✅ Any authenticated user can view donations
export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate("donorId", "username")
      .populate("receiverId", "username");
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Only receivers can update donation status
export const updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only the receiver who claimed it can update
    if (donation.receiverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update status" });
    }

    donation.status = req.body.status;
    await donation.save();

    // ✅ Re-query with populate
    const populated = await Donation.findById(donation._id)
      .populate("donorId", "username")
      .populate("receiverId", "username");

    return res.status(200).json({
      message: `Donation status updated to ${req.body.status}`,
      donation: populated
    });
  } catch (error) {
    console.error("Error updating donation status:", error);
    return res.status(500).json({ message: "Server error while updating donation status" });
  }
};

// ✅ Only donors can edit donations
export const EditDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // ✅ Only the donor who created it can edit
    if (donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this donation" });
    }

    // ✅ Only allow editing quantity with validation
    const newQty = req.body.qty;
    if (newQty === undefined || isNaN(newQty) || newQty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    donation.qty = newQty;
    await donation.save();

    // ✅ Re-query with populate for clean response
    const populated = await Donation.findById(donation._id)
      .populate("donorId", "username")
      .populate("receiverId", "username");

    return res.status(200).json({
      message: "Donation quantity updated successfully",
      donation: populated
    });
  } catch (error) {
    console.error("Error editing donation:", error);
    return res.status(500).json({ message: "Server error while editing donation" });
  }
};
// ✅ Any authenticated user can view a single donation
export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donorId", "username")
      .populate("receiverId", "username");
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};