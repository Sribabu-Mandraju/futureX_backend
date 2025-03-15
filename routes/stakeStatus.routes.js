import express from "express";
import {
  addActiveStake,
  resolveStake,
  getStakeStatuses,
} from "../controllers/stakeStatus.controllers.js";

const router = express.Router();


router.post("/active", addActiveStake);
router.post("/resolve", resolveStake);

// Get active and resolved stakes
router.get("/statuses", getStakeStatuses);

export default router;
