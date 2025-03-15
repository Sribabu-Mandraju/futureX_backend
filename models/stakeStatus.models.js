import mongoose from "mongoose";

const { Schema, model } = mongoose;

const StakeStatusSchema = new Schema(
  {
    activeStakes: { type: [String], default: [] }, // Array of active stake IDs
    resolvedStakes: { type: [String], default: [] }, // Array of resolved stake IDs
  },
  { timestamps: true }
);

export default model("StakeStatus", StakeStatusSchema);
