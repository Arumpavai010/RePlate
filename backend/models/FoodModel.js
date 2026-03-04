import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donorId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
  },
  receiverId: {
     type: mongoose.Schema.Types.ObjectId,
    ref: "User" },
  donor: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: { 
    type: String,
    required: true,
    trim: true
  },
  food: {
    type: String,
    required: true,
    trim: true
  },
  qty: {
    type: Number,
    required: true
  },
  prepTime: {
    type: String,
    trim: true
  },
  safeHours: {
    type: Number
  },
  location: {
    type: String,
    trim: true
  },
  lat: {
    type: Number
  },
  lon: {
    type: Number
  },
  status: {
    type: String,
    enum: ["Pending", "Requested", "Collected"],
    default: "Pending"
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}},{ timestamps: true });

export default mongoose.model("Donation", donationSchema);