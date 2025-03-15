import express from "express";
import {
  createStake,
  getProbabilityTrends,
  getUserStakes
} from "../controllers/stake.controllers.js";

const router = express.Router();

// Route to create a new stake
router.post("/create", createStake);

// Route to get YES/NO probabilities trends
router.get("/probabilities", getProbabilityTrends);

// Route to get user's stakes
router.get("/user/:address", getUserStakes);

export default router;
