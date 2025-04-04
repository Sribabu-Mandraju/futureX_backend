# FuturaX Backend - Node.js & Express Setup

## Introduction

The backend of **FuturaX** powers the decentralized prediction market by handling user authentication, bet management, smart contract interactions, and event result verification. Built with **Node.js and Express**, the backend ensures seamless integration with the blockchain while maintaining high performance and security.

## Prerequisites

Before setting up the backend, ensure you have:

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **MongoDB** (or any preferred database for storing user and bet data)
- **Git** (optional, for version control)

## Installation and Setup

Follow these steps to set up the backend locally:

### 1. Clone the Repository

```sh
git clone https://github.com/Sribabu-Mandraju/futureX_backend.git
cd futurax-backend
```

### 2. Install Dependencies

Using npm:

```sh
npm install
```

Using yarn:

```sh
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/XPgw_qPpyP6jd1vh_udqemcGWTyK0zwQ
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/XPgw_qPpyP6jd1vh_udqemcGWTyK0zwQ
ETHERSCAN_API_KEY=DIK1T2J6FRN77WBQSBITNTNHKS542NFQT2
COINMARKETCAP=47bab54c-249d-4464-b513-ba44a77db289
CODEX=d5f712c5641286378e36c171d5e5e8d16e49bf4a

# recommended
# if you want to test the project then please replace your mongo connecting string for MONGODB_URI
MONGODB_URI=mongodb+srv://n210522:63037sribabu@cluster0.k7mr9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

EVENT_FACTORY_ADDRESS=0xA3f8c89f25D6300d1cc5cfCe92CFe057f4331bc6
EVENT_FACTORY_OWNER_ADDRESS=0x073C5802eB1f53C0e649F6e4f80AD44f418dd32A
PROTOCOL_FEE_ADDRESS=0xD03cBa7a8B0D9aB531172eA087d17f0741200d5b
USDC_FEE_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238


```

### 4. Start the Backend Server

```sh
npm run dev
```

The server will start at `http://localhost:8080/`.

### Live Deployment

You can also access the deployed backend here: [FuturaX Backend](https://your-deployed-link.com)

## Project Structure

```
📂 futurax-backend
 ├── 📂 src
 │   ├── 📂 controllers   # Handles API requests
 │   ├── 📂 routes        # API route definitions
 │   ├── 📂 models        # Database models (MongoDB)
 │   ├── index.js        # Server entry point
 ├── 📜 package.json     # Project dependencies
 ├── 📜 .env             # Sample environment variables
 ├── 📜 README.md        # Project documentation
 ├── 📜 .gitignore       # Files to ignore in version control
```




To deploy the backend on **Vercel, Heroku, or AWS**, follow these steps:

1. Set up a production database.
2. Configure the `.env` file with production values.
3. Build and deploy using your hosting provider’s guide.

## Contributors

👨‍💻 **[Nandeesh (0x02Auditor)](https://twitter.com/0x02Auditor)** – Lead Developer  
🔗 **[Bhanu Teja](https://twitter.com/BhanuTeja)** – Backend Developer  
🎨 **[Sribabu (5r1b4bu)](https://twitter.com/5r1b4bu)** – API & Database Developer  

---

### **Start Building with FuturaX!**

With the backend set up, you’re now ready to integrate the API with the frontend and blockchain smart contracts.

📌 **Website:** [FuturaX Official Site](https://future-x-ulpg.vercel.app)

