const ethers = require("ethers");
const aspJSON = require("../abi/asp.json");
const anonAspJSON = require("../abi/anonAsp.json");
const aspABI = aspJSON.abi;
const anonAspABI = anonAspJSON.abi;
const {
  AnonAadhaarPCD,
  exportCallDataGroth16FromPCD,
} = require("anon-aadhaar-pcd");

require("dotenv").config();

function getRPC(input) {
  switch (input) {
    case "534351":
      return "https://sepolia-rpc.scroll.io/"; //scrollSepolia

    case "84531":
      return "https://base-goerli.public.blastapi.io"; //base

    case "421613":
      return "https://goerli-rollup.arbitrum.io/rpc"; // arbitrumGoerli

    case "80001":
      return "https://polygon-mumbai-bor.publicnode.com"; // mumbai

    case "44787":
      return "https://alfajores-forno.celo-testnet.org"; // celo

    case "5001":
      return "https://rpc.testnet.mantle.xyz"; // Mantle

    case "195":
      return "https://testrpc.x1.tech/"; // Okx

    case "1442":
      return "https://rpc.public.zkevm-test.net"; // polygonzkevm

    default:
      throw new Error("Invalid input. No matching case found.");
  }
}

const addCommitment = async (req, res) => {
  try {
    let commitment = req.body.commitment;
    const asp_address = req.body.asp_address;
    const network = req.body.network;
    let rpc = getRPC(network);
    console.log('===========>>>>>>>>>>');
    console.log("commitment", commitment);
    const parsedObject = JSON.parse(commitment); // Convert the string back to BigInt

    commitment = BigInt(parsedObject.value);

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(asp_address, aspABI, provider);
    const contractWithWallet = contract.connect(wallet);

    let tx = await contractWithWallet.addUser(commitment);
    const _tx = await tx.wait();
    console.log(_tx);

    res.send({
      hash: _tx.transactionHash,
    });
  } catch (error) {
    console.error("Error adding commitment:", error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

const addAnonCommitment = async (req, res) => {
  try {
    let commitment = req.body.commitment;
    const asp_address = req.body.asp_address;
    const network = req.body.network;
    let rpc = getRPC(network);
    console.log(0.1);
    console.log("commitment", commitment);
    console.log(1);
    const parsedObject = JSON.parse(commitment);
    console.log(2);
    commitment = BigInt(parsedObject.value);
    console.log(3);
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    console.log(4);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(5);
    const contract = new ethers.Contract(asp_address, anonAspABI, provider);
    console.log(6);
    const contractWithWallet = contract.connect(wallet);
    console.log(7);
    const { a, b, c, Input } = await exportCallDataGroth16FromPCD(
      req.body.proof
    );
    console.log(8);
    const maxPriorityFeePerGas = ethers.utils.parseUnits("500", "gwei"); // Adjust this value as needed
    const maxFeePerGas = ethers.utils.parseUnits("600", "gwei"); // Adjust this value as needed
    console.log(9);
    console.log("a",a);
    console.log("b",b);
    console.log("c",c);
    console.log("ip",Input);
    let tx = await contractWithWallet.addUser(commitment, a, b, c, Input, 
    //   {
    //   maxPriorityFeePerGas: maxPriorityFeePerGas,
    //   maxFeePerGas: maxFeePerGas,
    // }
    );
    console.log(10);
    const _tx = await tx.wait();
    console.log(_tx);

    res.send({
      hash: _tx.transactionHash,
    });
  } catch (error) {
    console.error("Error adding commitment:", error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  addCommitment: addCommitment,
  addAnonCommitment: addAnonCommitment,
};
