import User from "../models/user.model";

export const createUser = async (req, res) => {
  try {
    const { name, wallet_address } = req.body;

    // Validate input
    if (!name || !wallet_address) {
      return res.status(400).json({ error: "Name and wallet_address are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ wallet_address });
    if (existingUser) {
      return res.status(400).json({ error: "User with this wallet address already exists." });
    }

    // Create and save user
    const user = new User({ name, wallet_address });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetch user details by wallet_address
 */
export const getUserByWallet = async (req, res) => {
  try {
    const { wallet_address } = req.params;

    // Validate wallet_address
    if (!wallet_address) {
      return res.status(400).json({ error: "Wallet address is required." });
    }

    const user = await User.findOne({ wallet_address });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user name by wallet_address
 */
export const updateUserName = async (req, res) => {
  try {
    const { wallet_address } = req.params;
    const { name } = req.body;

    // Validate input
    if (!wallet_address || !name) {
      return res.status(400).json({ error: "Wallet address and new name are required." });
    }

    const user = await User.findOneAndUpdate(
      { wallet_address },
      { name },
      { new: true, runValidators: true } // Return updated user and validate
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User name updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
