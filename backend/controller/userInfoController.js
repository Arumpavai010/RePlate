import User from "../models/userInfo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPass });
    await user.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id }, // payload
      process.env.JWT_SECRET, // secret key
      { expiresIn: "1h" } // expiry
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};