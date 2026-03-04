import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/FoodRoute.js';
import cors from 'cors';
import Userrouter from './routes/UserRoutes.js';
const app = express();
app.use(cors({origin : "https://replateproject.onrender.com"}));
app.use(express.json());
app.use('/api/donations', router);
app.use("/api/users", Userrouter);
const port = process.env.PORT || 4000;
const mongouri = process.env.MONGO_URI;

mongoose.connect(mongouri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err.message));

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});