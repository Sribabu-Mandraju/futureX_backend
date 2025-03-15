import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";

import stakeRoutes from "./routes/stake.routes.js";
import stateStatusRoutes from "./routes/stakeStatus.routes.js";

// Initialize dotenv for environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Swagger setup
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Secure API",
    version: "1.0.0",
    description:
      "A secure API with express, MongoDB, and Swagger documentation",
    contact: {
      name: "Developer",
      email: "developer@example.com",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Path to your API routes (adjust as needed)
};

// Use Swagger UI to serve documentation

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per window
});
app.use(limiter);

// Route for the base URL
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the secure API" });
});

app.use("/stake", stakeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

console.log(`Server configured to run on port ${PORT}`);
console.log("MongoDB connection attempted");
