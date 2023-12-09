import { useState, useContext, useRef, useEffect } from "react";
import utils from "../utils/$u.js";
import { ethers } from "ethers";
import styles from "../style/Interface.module.css";
import AccountContext from "../utils/accountContext";
const wc = require("../circuit/witness_calculator.js");
const cryptoMixerJSON = require("../json/CryptoMixer.json");
const cryptoMixerABI = cryptoMixerJSON.abi;
const cryptoMixerInterface = new ethers.utils.Interface(cryptoMixerABI);
const aspJSON = require("../json/Asp.json");
const aspABI = aspJSON.abi;
const aspInterface = new ethers.utils.Interface(aspABI);
let tempData = null;
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];
export default function Interface() {
  const proofTextAreaRef = useRef(null);
  const withdrawTextAreaRef = useRef(null);

  const [activeTab, setActiveTab] = useState("deposit");
  const [token, setToken] = useState("ETH");
  const [amount, setAmount] = useState("0.01");
  const { account } = useContext(AccountContext);
  const [proofElements, updateProofElements] = useState(null);
  const [asp, setAsp] = useState("ASP1");
  const [withdrawProof, setWithdrawProof] = useState("");
  const [aspData, updateAspData] = useState(null);
  const [contractAddresses, setContractAddresses] = useState({});

  useEffect(() => {
    async function loadAddresses() {
      try {
        const response = await fetch("/contractAddresses.json");
        const allAddresses = await response.json();
        const addressesForCurrentNetwork =
          allAddresses[account.chainId.toString()] || {};

        setContractAddresses(addressesForCurrentNetwork);
        console.log("Loaded addresses:", addressesForCurrentNetwork);
      } catch (error) {
        console.error("Failed to fetch contract addresses", error);
      }
    }

    if (account && account.chainId) {
      loadAddresses();
    }
  }, [account]);

  const handleTokenChange = async (e) => {
    const selectedToken = e.target.value;
    setToken(selectedToken);
    setAmount(selectedToken === "ETH" ? "0.01" : "1000");
  };
  const deposit = async () => {
    if (token === "USDC") {
      await approveUSDC();
      await depositUSDC();
    } else {
      await depositEther();
    }
  };
  const approveUSDC = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const usdcContract = new ethers.Contract(
        contractAddresses.contracts.USDC.erc20,
        erc20ABI,
        signer
      );

      const amountToApprove = ethers.utils.parseUnits("1000", 6);
      const tx = await usdcContract.approve(
        contractAddresses.contracts.USDC.cryptoMixer,
        amountToApprove
      );
      await tx.wait();

      console.log("Approval transaction successful:", tx.hash);
    } catch (error) {
      console.error("Approval transaction failed:", error);
    }
  };
  const depositUSDC = async () => {
    console.log("cryptoMixer", contractAddresses.contracts.USDC.cryptoMixer);
    const secret = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();
    const nullifier = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();

    const input = {
      secret: utils.BN256ToBin(secret).split(""),
      nullifier: utils.BN256ToBin(nullifier).split(""),
    };

    var res = await fetch("/deposit.wasm");
    var buffer = await res.arrayBuffer();
    var depositWC = await wc(buffer);

    const r = await depositWC.calculateWitness(input);

    const commitment = r[1];
    const nullifierHash = r[2];
    console.log("commitment", commitment);

    // const value = ethers.BigNumber.from("10000000000000000").toHexString();
    const tx = {
      to: contractAddresses.cryptoMixer,
      from: account.address,
      data: cryptoMixerInterface.encodeFunctionData("deposit", [commitment]),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      const receipt = await waitForTransactionReceipt(txHash);
      console.log(receipt);
      const log = receipt.logs[1];

      const decodedData = cryptoMixerInterface.decodeEventLog(
        "Deposit",
        log.data,
        log.topics
      );

      const proofElements = {
        root: utils.BNToDecimal(decodedData.root),
        nullifierHash: `${nullifierHash}`,
        secret: secret,
        nullifier: nullifier,
        commitment: `${commitment}`,
        hashPairing: decodedData.hashPairings.map((n) => utils.BNToDecimal(n)),
        hashDirections: decodedData.pairDirection,
      };
      console.log(proofElements);

      updateProofElements(btoa(JSON.stringify(proofElements)));
    } catch (error) {
      console.log(error);
    }

    console.log(commitment, nullifierHash);
  };
  async function waitForTransactionReceipt(txHash) {
    while (true) {
      const receipt = await window.ethereum.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      });

      if (receipt !== null) {
        return receipt;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  const depositEther = async () => {
    console.log("cryptoMixer", contractAddresses.cryptoMixer);
    const secret = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();
    const nullifier = ethers.BigNumber.from(
      ethers.utils.randomBytes(32)
    ).toString();

    const input = {
      secret: utils.BN256ToBin(secret).split(""),
      nullifier: utils.BN256ToBin(nullifier).split(""),
    };

    var res = await fetch("/deposit.wasm");
    var buffer = await res.arrayBuffer();
    var depositWC = await wc(buffer);

    const r = await depositWC.calculateWitness(input);

    const commitment = r[1];
    const nullifierHash = r[2];
    console.log("commitment", commitment);

    const value = ethers.BigNumber.from("10000000000000000").toHexString();
    const tx = {
      to: contractAddresses.cryptoMixer,
      from: account.address,
      value: value,
      data: cryptoMixerInterface.encodeFunctionData("deposit", [commitment]),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      const receipt = await waitForTransactionReceipt(txHash);
      console.log(receipt);
      const log = receipt.logs[1];

      const decodedData = cryptoMixerInterface.decodeEventLog(
        "Deposit",
        log.data,
        log.topics
      );

      const proofElements = {
        root: utils.BNToDecimal(decodedData.root),
        nullifierHash: `${nullifierHash}`,
        secret: secret,
        nullifier: nullifier,
        commitment: `${commitment}`,
        hashPairing: decodedData.hashPairings.map((n) => utils.BNToDecimal(n)),
        hashDirections: decodedData.pairDirection,
      };
      console.log(proofElements);

      updateProofElements(btoa(JSON.stringify(proofElements)));
    } catch (error) {
      console.log(error);
    }

    console.log(commitment, nullifierHash);
  };
  const withdraw = async () => {
    console.log("log1");
    console.log("log2");

    const withdrawProofValue = withdrawTextAreaRef.current
      ? withdrawTextAreaRef.current.value
      : "";
    console.log("log3");

    if (!withdrawProofValue) {
      alert("Please input the proof of deposit string.");
      return;
    }
    console.log("log4");

    try {
      const proofString = withdrawTextAreaRef.current.value;
      console.log(proofString);
      const proofElements = JSON.parse(atob(proofString));
      // const b_aspData = JSON.parse(atob(aspData));
      const b_aspData = aspData;
      console.log(proofElements);

      const input = {
        secret: utils.BN256ToBin(proofElements.secret).split(""),
        nullifier: utils.BN256ToBin(proofElements.nullifier).split(""),
      };

      var res = await fetch("/deposit.wasm");
      var buffer = await res.arrayBuffer();
      var depositWC = await wc(buffer);

      const r = await depositWC.calculateWitness(input);
      console.log("input", input);
      const commitment = r[1];
      console.log("oooooo", r);
      await callASP(commitment);

      console.log(1);
      const SnarkJS = window["snarkjs"];
      console.log(2);
      console.log(tempData);
      const proofInput = {
        root: proofElements.root, //utils.BNToDecimal(decodedData.root),
        nullifierHash: proofElements.nullifierHash,
        recipient: utils.BNToDecimal(account.address),
        associationHash: tempData.root,
        // "associationRecipient":utils.BNToDecimal(account.address),
        secret: utils.BN256ToBin(proofElements.secret).split(""),
        nullifier: utils.BN256ToBin(proofElements.nullifier).split(""),
        hashPairings: proofElements.hashPairing, //decodedData.hashPairings.map((n) => ($u.BNToDecimal(n))),
        hashDirections: proofElements.hashDirections, //decodedData.pairDirection,
        associationHashPairings: tempData.hashPairing, //decodedData.hashPairings.map((n) => ($u.BNToDecimal(n))),
        associationHashDirections: tempData.hashDirections, //decodedData.pairDirection
      };
      console.log(3);
      console.log(proofInput);
      const { proof, publicSignals } = await SnarkJS.groth16.fullProve(
        proofInput,
        "/withdraw.wasm",
        "/setup_final.zkey"
      );
      console.log(4);
      console.log("=========================================");
      console.log(proof);
      console.log(publicSignals);
      const callInputs = [
        proof.pi_a.slice(0, 2).map(utils.BN256ToHex),
        proof.pi_b
          .slice(0, 2)
          .map((row) => utils.reverseCoordinate(row.map(utils.BN256ToHex))),
        proof.pi_c.slice(0, 2).map(utils.BN256ToHex),
        publicSignals.slice(0, 3).map(utils.BN256ToHex),
      ];

      const callData = cryptoMixerInterface.encodeFunctionData(
        "withdraw",
        callInputs
      );
      const tx = {
        to: contractAddresses.cryptoMixer,
        from: account.address,
        data: callData,
      };
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      const receipt = await waitForTransactionReceipt(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const callASP = async (commitment) => {
    console.log("comm", commitment);

    const tx = {
      to: contractAddresses.asp,
      from: account.address,
      data: aspInterface.encodeFunctionData("addUser", [commitment]),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      const receipt = await waitForTransactionReceipt(txHash);
      console.log(receipt);
      const log = receipt.logs[0];

      const decodedData = aspInterface.decodeEventLog(
        "userAdded",
        log.data,
        log.topics
      );

      const aspElements = {
        root: utils.BNToDecimal(decodedData.root),
        hashPairing: decodedData.hashPairings.map((n) => utils.BNToDecimal(n)),
        hashDirections: decodedData.pairDirection,
      };

      // updateAspData(btoa(JSON.stringify(aspElements)));
      updateAspData(aspElements);
      tempData = aspElements;

      console.log("===============!!!!!!!!===============");
      console.log("aspElements", aspElements);
      // console.log('btoa(JSON.stringify(aspElements))',btoa(JSON.stringify(aspElements)));
      console.log("================!!!!!!!!!!!==============");
    } catch (error) {
      console.log(error);
    }
  };

  const copyProof = () => {
    // Check if the text area exists
    if (proofTextAreaRef.current) {
      proofTextAreaRef.current.select(); // Select the text inside the text area
      document.execCommand("copy"); // Execute the copy command
    }
  };

  return (
    <div className={styles.interface}>
      {account ? (
        <p>Account Address: {account.address}</p>
      ) : (
        <p>No account connected</p>
      )}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("deposit")}
          className={`${styles.tab} ${
            activeTab === "deposit" ? styles.active : ""
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`${styles.tab} ${
            activeTab === "withdraw" ? styles.active : ""
          }`}
        >
          Withdraw
        </button>
      </div>

      <div className={styles.form}>
        <label htmlFor="amount">Amount</label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label htmlFor="token">Token</label>
        <select id="token" value={token} onChange={handleTokenChange}>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
        </select>

        {activeTab === "deposit" ? (
          <>
            <button onClick={deposit} className={styles.depositButton}>
              Deposit
            </button>
            <textarea
              ref={proofTextAreaRef} // Attach the ref to the textarea
              className={styles.proof}
              value={proofElements} // Set the text content to proofElements state
            />{" "}
            <button onClick={copyProof} className={styles.copyButton}>
              Copy
            </button>
          </>
        ) : (
          <>
            <textarea
              ref={withdrawTextAreaRef} // Attach the ref to the withdrawal textarea
              className={styles.proof}
              defaultValue={proofElements} // Set the default value to proofElements
              onChange={(e) => setWithdrawProof(e.target.value)} // Update state on change
              placeholder="Paste the deposit proof here"
            />

            <label htmlFor="asp">ASP</label>
            <select
              id="asp"
              value={asp}
              onChange={(e) => setAsp(e.target.value)}
            >
              <option value="ASP1">ASP1</option>
            </select>

            <button onClick={withdraw} className={styles.withdrawButton}>
              Withdraw
            </button>
          </>
        )}
      </div>
    </div>
  );
}
