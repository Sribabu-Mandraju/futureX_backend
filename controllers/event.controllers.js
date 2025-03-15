import { ethers } from "ethers"
import dotenv from "dotenv"
import eventFactoryABI from "../abis/EventFactoryABI.js"
import eventABI from "../abis/EventABI.js"
import usdcABI from "../abis/USDCABI.js"

dotenv.config()

// Setup provider with error handling
let provider
try {
  const rpcUrl = process.env.SEPOLIA_RPC_URL
  provider = new ethers.JsonRpcProvider(rpcUrl)
  console.log("Provider initialized successfully.")
} catch (error) {
  console.error("Failed to initialize provider:", error.message)
  process.exit(1)
}

// Contract addresses
const eventFactoryAddress = process.env.EVENT_FACTORY_ADDRESS
const usdcAddress = process.env.USDC_ADDRESS

// Initialize contract instances
let eventFactory
let usdc

try {
  if (!eventFactoryAddress || eventFactoryAddress === "") {
    throw new Error("Invalid event factory address. Please set a valid address in .env")
  }

  if (!usdcAddress || usdcAddress === "") {
    throw new Error("Invalid USDC address. Please set a valid address in .env")
  }

  // Initialize the factory contract
  eventFactory = new ethers.Contract(eventFactoryAddress, eventFactoryABI, provider)
  console.log("Event Factory contract initialized successfully.")

  // Initialize the USDC contract
  usdc = new ethers.Contract(usdcAddress, usdcABI, provider)
  console.log("USDC contract initialized successfully.")
} catch (error) {
  console.error("Failed to initialize contracts:", error.message)
  process.exit(1)
}

// Helper function to get a signer
const getSigner = (privateKey) => {
  try {
    return new ethers.Wallet(privateKey, provider)
  } catch (error) {
    throw new Error(`Failed to create signer: ${error.message}`)
  }
}

// Helper function to get an event contract instance
const getEventContract = async (eventAddress) => {
  try {
    return new ethers.Contract(eventAddress, eventABI, provider)
  } catch (error) {
    throw new Error(`Failed to get event contract: ${error.message}`)
  }
}

// Controller functions
export const createEvent = async (req, res) => {
  try {
    const { description, deadline, privateKey } = req.body

    if (!description || !deadline || !privateKey) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    const signer = getSigner(privateKey)
    const factoryWithSigner = eventFactory.connect(signer)

    // Convert deadline to Unix timestamp if it's a Date string
    const deadlineTimestamp = typeof deadline === "string" ? Math.floor(new Date(deadline).getTime() / 1000) : deadline

    const tx = await factoryWithSigner.createEvent(description, deadlineTimestamp)
    const receipt = await tx.wait()

    // Find the EventCreated event in the logs
    const eventCreatedLog = receipt.logs
      .map((log) => {
        try {
          return eventFactory.interface.parseLog(log)
        } catch (e) {
          return null
        }
      })
      .filter((parsedLog) => parsedLog && parsedLog.name === "EventCreated")[0]

    if (!eventCreatedLog) {
      return res.status(500).json({ error: "Event created but couldn't find event address in logs" })
    }

    const eventAddress = eventCreatedLog.args[0]

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        transactionHash: receipt.hash,
        eventAddress,
        description,
        deadline: deadlineTimestamp,
      },
    })
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ error: error.message })
  }
}

export const getDeployedEvents = async (req, res) => {
  try {
    const events = await eventFactory.getDeployedEvents()

    // Get details for each event
    const eventsWithDetails = await Promise.all(
      events.map(async (eventAddress) => {
        const eventContract = await getEventContract(eventAddress)
        const details = await eventContract.getEventDetails()

        return {
          address: eventAddress,
          description: details[0],
          deadline: Number(details[1]),
          resolved: details[2],
          winningOption: details[3],
          totalYesBets: ethers.formatUnits(details[4], 6), // Assuming USDC has 6 decimals
          totalNoBets: ethers.formatUnits(details[5], 6),
        }
      }),
    )

    res.status(200).json({
      success: true,
      data: eventsWithDetails,
    })
  } catch (error) {
    console.error("Error getting deployed events:", error)
    res.status(500).json({ error: error.message })
  }
}

export const getEventDetails = async (req, res) => {
  try {
    const { eventAddress } = req.params

    if (!eventAddress) {
      return res.status(400).json({ error: "Event address is required" })
    }

    const eventContract = await getEventContract(eventAddress)
    const details = await eventContract.getEventDetails()

    console.log(details)

    // Get user bets if address is provided
    let userBet = null
    if (req.query.userAddress) {
      const bet = await eventContract.bets(req.query.userAddress)
      if (bet.amount > 0) {
        userBet = {
          amount: ethers.formatUnits(bet.amount, 6),
          choice: bet.choice,
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        address: eventAddress,
        description: details[0],
        deadline: Number(details[1]),
        resolved: details[2],
        winningOption: details[3],
        totalYesBets: ethers.formatUnits(details[4], 6),
        totalNoBets: ethers.formatUnits(details[5], 6),
        userBet,
      },
    })
  } catch (error) {
    console.error("Error getting event details:", error)
    res.status(500).json({ error: error.message })
  }
}

  export const placeBet = async (req, res) => {
    try {
      const { eventAddress, choice, amount, privateKey } = req.body

      if (!eventAddress || choice === undefined || !amount || !privateKey) {
        return res.status(400).json({ error: "Missing required parameters" })
      }

      const signer = getSigner(privateKey)
      const userAddress = signer.address

      // Get event contract with signer
      const eventContract = (await getEventContract(eventAddress)).connect(signer)

      // Get USDC contract with signer
      const usdcWithSigner = usdc.connect(signer)

      // Convert amount to USDC units (6 decimals)
      const amountInUnits = ethers.parseUnits(amount.toString(), 6)

      // Check USDC balance
      const balance = await usdcWithSigner.balanceOf(userAddress)
      if (balance < amountInUnits) {
        return res.status(400).json({
          error: "Insufficient USDC balance",
          balance: ethers.formatUnits(balance, 6),
        })
      }

      // Approve USDC transfer
      const approveTx = await usdcWithSigner.approve(eventAddress, amountInUnits)
      await approveTx.wait()

      // Place bet
      const betTx = await eventContract.placeBet(choice, amountInUnits)
      const receipt = await betTx.wait()

      res.status(200).json({
        success: true,
        message: "Bet placed successfully",
        data: {
          transactionHash: receipt.hash,
          eventAddress,
          userAddress,
          choice,
          amount,
        },
      })
    } catch (error) {
      console.error("Error placing bet:", error)
      res.status(500).json({ error: error.message })
    }
  }


// resolve event frontend
// const resolveEvent = async () => {
//     if (!window.ethereum) {
//       alert("MetaMask is required!");
//       return;
//     }
  
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     await provider.send("eth_requestAccounts", []); // Request access to user's wallet
//     const signer = await provider.getSigner(); // Get signer (connected wallet)
  
//     const eventAddress = "0xYourEventContractAddress";
//     const winningOption = 1;
  
//     const eventContract = new ethers.Contract(eventAddress, EventABI, signer);
    
//     // Create transaction (signed by MetaMask)
//     const tx = await eventContract.resolveEvent(winningOption);
//     await tx.wait();
  
//     console.log("Transaction successful:", tx.hash);
//   };


// frontend for respove event ending 

export const resolveEvent = async (req, res) => {
    try {
      const { signedTx } = req.body;
      if (!signedTx) {
        return res.status(400).json({ error: "Missing signed transaction" });
      }
  
      // Send the transaction to the blockchain
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const txResponse = await provider.sendTransaction(signedTx);
      const receipt = await txResponse.wait();
  
      res.status(200).json({
        success: true,
        message: "Event resolved successfully",
        transactionHash: receipt.transactionHash,
      });
    } catch (error) {
      console.error("Error resolving event:", error);
      res.status(500).json({ error: error.message });
    }
  };


export const claimRewards = async (req, res) => {
  try {
    const { eventAddress, privateKey } = req.body

    if (!eventAddress || !privateKey) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    const signer = getSigner(privateKey)
    const eventContract = (await getEventContract(eventAddress)).connect(signer)

    const tx = await eventContract.claimRewards()
    const receipt = await tx.wait()

    res.status(200).json({
      success: true,
      message: "Rewards claimed successfully",
      data: {
        transactionHash: receipt.hash,
        eventAddress,
        userAddress: signer.address,
      },
    })
  } catch (error) {
    console.error("Error claiming rewards:", error)
    res.status(500).json({ error: error.message })
  }
}

export const refundStake = async (req, res) => {
  try {
    const { eventAddress, privateKey } = req.body

    if (!eventAddress || !privateKey) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    const signer = getSigner(privateKey)
    const eventContract = (await getEventContract(eventAddress)).connect(signer)

    const tx = await eventContract.refundStake()
    const receipt = await tx.wait()

    res.status(200).json({
      success: true,
      message: "Stake refunded successfully",
      data: {
        transactionHash: receipt.hash,
        eventAddress,
        userAddress: signer.address,
      },
    })
  } catch (error) {
    console.error("Error refunding stake:", error)
    res.status(500).json({ error: error.message })
  }
}

export const withdrawFees = async (req, res) => {
  try {
    const { feeAddress, privateKey } = req.body

    if (!feeAddress || !privateKey) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    const signer = getSigner(privateKey)

    // Create FeeAddress contract instance
    const feeAddressABI = ["function withdraw() external", "function owner() view returns (address)"]

    const feeContract = new ethers.Contract(feeAddress, feeAddressABI, signer)

    // Check if signer is owner
    const owner = await feeContract.owner()
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      return res.status(403).json({ error: "Not authorized. Only owner can withdraw fees." })
    }

    const tx = await feeContract.withdraw()
    const receipt = await tx.wait()

    res.status(200).json({
      success: true,
      message: "Fees withdrawn successfully",
      data: {
        transactionHash: receipt.hash,
        feeAddress,
      },
    })
  } catch (error) {
    console.error("Error withdrawing fees:", error)
    res.status(500).json({ error: error.message })
  }
}

export const getUsdcBalance = async (req, res) => {
  try {
    const { address } = req.params

    if (!address) {
      return res.status(400).json({ error: "Address is required" })
    }

    const balance = await usdc.balanceOf(address)

    res.status(200).json({
      success: true,
      data: {
        address,
        balance: ethers.formatUnits(balance, 6),
      },
    })
  } catch (error) {
    console.error("Error getting USDC balance:", error)
    res.status(500).json({ error: error.message })
  }
}

