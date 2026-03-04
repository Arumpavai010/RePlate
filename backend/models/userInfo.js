import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
    role: {
    type: String,
    enum: ["donor", "receiver"], 
    required: true 
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);