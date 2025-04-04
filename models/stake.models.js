import mongoose from "mongoose";

const { Schema, model } = mongoose;

const StakeSchema = new Schema(
  {
    stakeAddress: { type: String, required: true },
    stakedAmount: { type: Number, required: true },
    userAddress: { type: String, required: true },
    selectedOption: { type: String, enum: ["YES", "NO"], required: true },
    isClaimed: { type: Boolean, default: false }, // New field added
  },
  { timestamps: true }
);

export default model("Stake_Model", StakeSchema);
