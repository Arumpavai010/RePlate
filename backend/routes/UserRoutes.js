import express from "express";
import { registerUser, loginUser } from "../controller/userInfoController.js";
import { authMiddleware } from "../middleware/auth.js";

const Userrouter = express.Router();
Userrouter.post("/register", registerUser);
Userrouter.post("/login", loginUser);
Userrouter.get("/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    role: req.user.role   // ✅ use req.user, not user
  });
});
export default Userrouter;