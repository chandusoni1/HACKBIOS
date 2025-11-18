import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; // Import Mongoose
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

// REPLACE THIS string with your actual MongoDB Connection String
// If using local MongoDB: 'mongodb://127.0.0.1:27017/drdo_verification'
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drdo_verification';

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('DRDO Verification API is running with MongoDB.');
});

// Connect to MongoDB then start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));