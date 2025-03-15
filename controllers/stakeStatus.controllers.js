import stakeStatusModels from "../models/stakeStatus.models.js";

// Add a new stake to activeStakes
export const addActiveStake = async (req, res) => {
  try {
    const { stakeAddress } = req.body;

    if (!stakeAddress) {
      return res.status(400).json({ message: "Stake address is required." });
    }

    // Find or create the stake status document
    let stakeStatus = await StakeStatus.findOne();
    if (!stakeStatus) {
      stakeStatus = new StakeStatus();
    }

    // Add new stake to activeStakes
    stakeStatus.activeStakes.push(stakeAddress);
    await stakeStatus.save();

    res.status(200).json({
      message: "Stake added to activeStakes.",
      activeStakes: stakeStatus.activeStakes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding active stake", error: error.message });
  }
};

// Move stake from activeStakes to resolvedStakes
export const resolveStake = async (req, res) => {
  try {
    const { stakeAddress } = req.body;

    if (!stakeAddress) {
      return res.status(400).json({ message: "Stake address is required." });
    }

    // Find stake status document
    let stakeStatus = await StakeStatus.findOne();
    if (!stakeStatus) {
      return res.status(404).json({ message: "No stake status found." });
    }

    // Check if stake exists in activeStakes
    const index = stakeStatus.activeStakes.indexOf(stakeAddress);
    if (index === -1) {
      return res.status(404).json({ message: "Stake not found in activeStakes." });
    }

    // Remove stake from activeStakes and add it to resolvedStakes
    stakeStatus.activeStakes.splice(index, 1);
    stakeStatus.resolvedStakes.push(stakeAddress);
    await stakeStatus.save();

    res.status(200).json({
      message: "Stake moved to resolvedStakes.",
      activeStakes: stakeStatus.activeStakes,
      resolvedStakes: stakeStatus.resolvedStakes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error resolving stake", error: error.message });
  }
};

// Get both activeStakes and resolvedStakes
export const getStakeStatuses = async (req, res) => {
  try {
    const stakeStatus = await StakeStatus.findOne();

    if (!stakeStatus) {
      return res.status(404).json({ message: "No stake status found." });
    }

    res.status(200).json({
      activeStakes: stakeStatus.activeStakes,
      resolvedStakes: stakeStatus.resolvedStakes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stake statuses", error: error.message });
  }
};
