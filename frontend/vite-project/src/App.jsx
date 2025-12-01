import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { SimpleMultiplier_abi, SimpleMultiplier_contractAddress } from "./abi/simpleMultiplicationabi.js";
import { notifications } from "@mantine/notifications";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [input0, setInput0] = useState("");
  const [input1, setInput1] = useState("");
  const [status, setStatus] = useState("");
  const [contract, setContract] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const data = { input0, input1 };
  const config = { headers: { "Content-Type": "application/json" } };

  const cardClass = "bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center";
  const inputClass = "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors";
  const connectBtnClass = "w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105";
  const submitBtnClass = "w-full py-3 px-6 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  const statusBoxClass = "mt-6 p-4 text-sm rounded-xl bg-blue-100 text-blue-700";

  // ---- Request Handler ----
  const handleRequest = async () => {
    if (!contract) {
      setStatus("Contract not initialized.");
      return;
    }
    if (input0 === "" || input1 === "") {
      setStatus("Please enter both numbers.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("Generating proof...");
      const res = await axios.post("http://localhost:4000/generate_proof", data, config);

      notifications.show({
        message: "Proof generated successfully! Submitting transaction...",
        color: "green",
      });

      const { proof, publicSignals } = res.data;

      setStatus("Submitting transaction...");
      const signals = publicSignals.map(s => BigInt(s)); // convert strings back to BigInt
      console.log("Submitting to contract:", proof, signals);
      const txResult = await contract.submitProof(proof, signals);

      console.log("Transaction confirmed:", txResult);
      notifications.show({
        message: `Transaction succeeded! Tx Hash: ${txResult.hash}`,
        color: "green",
        autoClose: false,
      });
      setStatus("Transaction succeeded!");
    } catch (err) {
      const statusCode = err?.response?.status;
      const errorMsg = err?.response?.data?.error;
      notifications.show({
        message: `Error ${statusCode ?? ""}: ${errorMsg ?? err.message}`,
        color: "red",
      });
      setStatus("Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Wallet check on load ----
  useEffect(() => {
    if (!window.ethereum) return;

    const checkWallet = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          initializeContract();
        }
      } catch (err) {
        console.error("Error checking for accounts:", err);
      }
    };

    checkWallet();

    // Optional: Listen for account change
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        initializeContract();
      } else {
        setWalletAddress(null);
        setContract(null);
      }
    });
  }, []);

  // ---- Contract init ----
  const initializeContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(SimpleMultiplier_contractAddress, SimpleMultiplier_abi, signer);
      setContract(contractInstance);
      setStatus("Wallet connected and contract initialized.");
    } catch (err) {
      console.error("Error initializing contract:", err);
      setStatus("Error: Could not connect to contract.");
    }
  };

  // ---- Wallet connect ----
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        initializeContract();
      }
    } catch (err) {
      console.error("MetaMask connection error:", err);
      setStatus("Connection failed or request rejected.");
    }
  };

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className={cardClass}>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">ZKP</h1>
        <p className="text-lg text-gray-600 mb-8">Frontend to connect wallet</p>

        {!walletAddress ? (
          <button onClick={connectWallet} className={connectBtnClass}>
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gray-200 rounded-xl text-gray-700 text-sm break-words">
              Connected Address: <span className="font-mono font-semibold">{walletAddress}</span>
            </div>

            <div className="flex flex-col space-y-4">
              <input type="number" placeholder="Enter number 1" value={input0} onChange={(e) => setInput0(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Enter number 2" value={input1} onChange={(e) => setInput1(e.target.value)} className={inputClass} />
            </div>

            <button onClick={handleRequest} className={submitBtnClass} disabled={isSubmitting || !contract || input0 === "" || input1 === ""}>
              {isSubmitting ? "Processing..." : "Submit Proof"}
            </button>
          </div>
        )}

        {status && <div className={statusBoxClass}>{status}</div>}
      </div>
    </div>
  );
}

export default App;
