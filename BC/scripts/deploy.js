// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

async function main() {
  // deploy hasher
  const Hasher = await ethers.getContractFactory("Hasher");
  const hasher = await Hasher.deploy();
  await hasher.deployed();
  console.log('Hasher deployed at',hasher.address);

 // deploy verifier
 const Verifier = await ethers.getContractFactory("Groth16Verifier");
 const verifier = await Verifier.deploy();
 await verifier.deployed();
 console.log('Verifier deployed at',verifier.address);

 const ASP = await ethers.getContractFactory("ASP");
 const asp = await ASP.deploy(hasher.address);
 await asp.deployed();
 console.log('ASP deployed at',asp.address);


  // deploy CryptoMixer
  const CryptoMixer = await ethers.getContractFactory("CryptoMixer");
  const cryptoMixer = await CryptoMixer.deploy(hasher.address, verifier.address, asp.address);
  await cryptoMixer.deployed();
  console.log('CryptoMixer deployed at',cryptoMixer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
