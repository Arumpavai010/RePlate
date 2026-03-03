import Donation from "../models/FoodModel.js";

const parseNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

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
    res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: error.message });
  }
};

export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (donation.receiverId) {
      return res.status(400).json({ message: "Already claimed" });
    }

    donation.receiverId = req.user._id;
    donation.status = "Requested";
    await donation.save();

    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.receiverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update status" });
    }

    donation.status = req.body.status;
    await donation.save();

    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const EditDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this donation" });
    }
    const allowedUpdates = ["food", "qty", "prepTime", "safeHours", "location", "lat", "lon"];
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        donation[key] = req.body[key];
      }
    });
    await donation.save();
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonation = async(req, res) =>{
  const{id} = req.params;
  try{
    const donation = await Donation.findById(id)
    res.status(200).json(donation)
  }catch(error){
    res.status(500).json({ message : error.message})
  }
}