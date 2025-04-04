import Stake from "../models/stake.models.js";

// Create a new stake
export const createStake = async (req, res) => {
  try {
    const {
      stakeAddress,
      stakedAmount,
      userAddress,
      selectedOption,
    } = req.body;

    // Validate required fields
    if (!stakeAddress || !stakedAmount || !userAddress || !selectedOption) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create and save the stake
    const newStake = new Stake({
      stakeAddress,
      stakedAmount,
      userAddress,
      selectedOption,
    });
    await newStake.save();

    res
      .status(201)
      .json({ message: "Stake created successfully.", stake: newStake });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating stake", error: error.message });
  }
};

// Get probabilities of YES and NO stakes
export const getProbabilityTrends = async (req, res) => {
  try {
    const { eventAddress, interval = 5 } = req.query; // Interval in minutes

    if (!eventAddress) {
      return res
        .status(400)
        .json({ message: "eventAddress query param is required." });
    }

    const intervalMs = interval * 60 * 1000; // Convert minutes to milliseconds

    // Aggregate stakes based on time intervals
    const probabilityTrends = await Stake.aggregate([
      { $match: { stakeAddress: eventAddress } },
      {
        $group: {
          _id: {
            $toDate: {
              $subtract: [
                { $toLong: "$createdAt" },
                { $mod: [{ $toLong: "$createdAt" }, intervalMs] },
              ],
            },
          },
          totalStakes: { $sum: 1 },
          yesCount: {
            $sum: { $cond: [{ $eq: ["$selectedOption", "YES"] }, 1, 0] },
          },
          noCount: {
            $sum: { $cond: [{ $eq: ["$selectedOption", "NO"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format response
    const formattedTrends = probabilityTrends.map((entry) => {
      const yesProbability =
        entry.totalStakes > 0 ? (entry.yesCount / entry.totalStakes) * 100 : 0;
      const noProbability =
        entry.totalStakes > 0 ? (entry.noCount / entry.totalStakes) * 100 : 0;

      return {
        timestamp: entry._id, // Time interval
        totalStakes: entry.totalStakes,
        yesCount: entry.yesCount,
        noCount: entry.noCount,
        yesProbability: yesProbability.toFixed(2) + "%",
        noProbability: noProbability.toFixed(2) + "%",
      };
    });

    res.json({ eventAddress, trends: formattedTrends });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching probability trends",
      error: error.message,
    });
  }
};

export const getUserStakes = async (req, res) => {
  try {
    const { userAddress } = req.params; // Extract userAddress from request params

    if (!userAddress) {
      return res.status(400).json({ message: "User address is required" });
    }

    const stakes = await Stake.find({ userAddress });

    return res.status(200).json(stakes);
  } catch (error) {
    console.error("Error fetching user stakes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateIsClaimed = async (req, res) => {
  try {
    const { eventAddress, userAddress } = req.body;

    if (!eventAddress || !userAddress) {
      return res
        .status(400)
        .json({ message: "Event address and user address are required." });
    }

    // Find and update the stake
    const updatedStake = await Stake.findOneAndUpdate(
      { stakeAddress: eventAddress, userAddress, isClaimed: false }, // Only update if it's not already claimed
      { isClaimed: true },
      { new: true }
    );

    if (!updatedStake) {
      return res
        .status(404)
        .json({ message: "No eligible stake found to update." });
    }

    res
      .status(200)
      .json({ message: "Stake updated successfully.", stake: updatedStake });
  } catch (error) {
    console.error("Error updating isClaimed:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


export const deleteStake = async (req, res) => {
  try {
    const { stakeAddress, userAddress } = req.body;

    // Validate required fields
    if (!stakeAddress || !userAddress) {
      return res.status(400).json({ message: "Stake address and user address are required." });
    }

    // Find and delete the stake
    const deletedStake = await Stake.findOneAndDelete({
      stakeAddress,
      userAddress
    });

    if (!deletedStake) {
      return res.status(404).json({ message: "Stake not found." });
    }

    res.status(200).json({ message: "Stake deleted successfully.", stake: deletedStake });
  } catch (error) {
    console.error("Error deleting stake:", error);
    res.status(500).json({ message: "Error deleting stake", error: error.message });
  }
};