import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  wallet_address: {
    type: String,
    required: true,
    unique: true,
  },
  biddings: {
    type: [String], // Array of strings (you can change type if needed)
    default: [],
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
