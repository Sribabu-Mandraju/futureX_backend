import mongoose from "mongoose";

const { Schema, model } = mongoose;

const StakeStatusSchema = new Schema(
  {
    activeStakes: [
      {
        stakeAddress: { type: String, required: true },
        category: { type: String, required: true },
      },
    ],
    resolvedStakes: [
      {
        stakeAddress: { type: String, required: true },
        category: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default model("StakeStatus_Model", StakeStatusSchema);
