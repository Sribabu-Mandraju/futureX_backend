import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

import stakeRoutes from "./routes/stake.routes.js";
import stakeStatusRoutes from "./routes/stakeStatus.routes.js";

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Files will be saved in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept specific file types only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx|xls)$/)) {
    return cb(new Error('Only image and document files are allowed!'), false);
  }
  cb(null, true);
};

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: fileFilter
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// File upload routes
// Single file upload
app.post("/upload/single", upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'Please upload a file.' });
    }
    
    res.status(200).send({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}` // URL to access the file
      }
    });
  } catch (error) {
    res.status(500).send({
      message: `Error uploading file: ${error.message}`
    });
  }
});

// Multiple files upload (up to 5 files)
app.post("/upload/multiple", upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: 'Please upload at least one file.' });
    }
    
    const fileInfos = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`
    }));
    
    res.status(200).send({
      message: 'Files uploaded successfully',
      files: fileInfos
    });
  } catch (error) {
    res.status(500).send({
      message: `Error uploading files: ${error.message}`
    });
  }
});

// Original routes
app.use("/stake", stakeRoutes);
app.use("/stakeStatus", stakeStatusRoutes);

// Error handling middleware for Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      message: `Multer error: ${err.message}`,
      code: err.code
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      message: `Error: ${err.message}`
    });
  }
  next();
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});