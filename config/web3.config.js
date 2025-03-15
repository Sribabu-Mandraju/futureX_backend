import { ethers } from "ethers";

// Setup provider with error handling
let provider;
try {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  provider = new ethers.JsonRpcProvider(rpcUrl);
  console.log("Provider initialized successfully.");
} catch (error) {
  console.error("Failed to initialize provider:", error.message);
}

// Example ABI - replace with your contract ABI
export const contractABI = [
  // Add your contract ABI here
];

// Example contract address - replace with your contract address
export const contractAddress = process.env.CONTACT_ADDRESS;

// Initialize contract instance with error handling
let contract;
try {
  if (!contractAddress || contractAddress === "") {
    throw new Error("Invalid contract address. Please set a valid contract address.");
  }
  if (!contractABI.length) {
    throw new Error("Contract ABI is missing. Please provide a valid ABI.");
  }
  contract = new ethers.Contract(contractAddress, contractABI, provider);
  console.log("Contract initialized successfully.");
} catch (error) {
  console.error("Failed to initialize contract:", error.message);
}

export { provider, contract };
