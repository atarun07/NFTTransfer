import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NFT_abi, NFT_contractAddress } from "./abi/NFTabi.js"
import { SimpleMultiplier_abi, SimpleMultiplier_contractAddress } from "./abi/simpleMultiplicationabi.js"


// Paste your contract's ABI here
const nftABI = NFT_abi
const simpleMultiplierABI = SimpleMultiplier_abi



// The address of your deployed contract
const NFT_CONTRACT_ADDRESS = NFT_contractAddress
const Simple_Multiplier_CONTRACT_ADDRESS = SimpleMultiplier_contractAddress


function App() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [recipientAddress, setRecipientAddress] = useState('');
    const [tokenURI, setTokenURI] = useState('');
    const [status, setStatus] = useState('');
    const [contract, setContract] = useState(null);
    // New state variables for finding the owner
    const [findOwnerTokenId, setFindOwnerTokenId] = useState('');
    const [tokenOwner, setTokenOwner] = useState(null);

    // Checks if a wallet is connected when the app loads
    useEffect(() => {
        async function checkWallet() {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    initializeContract();
                }
            }
        }
        checkWallet();
    }, []);

    // Initializes the contract instance with the connected wallet
    const initializeContract = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftABI, signer);
            setContract(contractInstance);
            setStatus("Wallet connected and contract initialized.");
        } catch (error) {
            console.error("Error initializing contract:", error);
            setStatus("Error: Could not connect to contract.");
        }
    };

    // Connects to the MetaMask wallet
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask to use this DApp!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(accounts[0]);
            initializeContract();
        } catch (error) {
            console.error(error);
            setStatus("Connection failed. Please check MetaMask.");
        }
    };

    // Handles the NFT minting process
    const handleMint = async () => {
        if (!contract) {
            setStatus("Please connect your wallet first.");
            return;
        }
        if (!recipientAddress || !tokenURI) {
            setStatus("Please fill in both fields.");
            return;
        }

        try {
            setStatus("Minting NFT... Please confirm the transaction in MetaMask.");
            // Call the safeMint function from your contract
            const tx = await contract.safeMint(recipientAddress, tokenURI);
            await tx.wait(); // Wait for the transaction to be mined
            setStatus(`Minting successful! Transaction hash: ${tx.hash}`);
            setRecipientAddress('');
            setTokenURI('');
        } catch (error) {
            console.error(error);
            setStatus("Minting failed. See console for details.");
        }
    };

    // New function to find the owner of a token
    const findOwner = async () => {
        if (!contract) {
            setStatus("Please connect your wallet first.");
            return;
        }
        if (!findOwnerTokenId) {
            setStatus("Please enter a Token ID to find the owner.");
            return;
        }
        try {
            setStatus("Fetching owner...");
            // Call the ownerOf function from your contract
            const owner = await contract.ownerOf(findOwnerTokenId);
            setTokenOwner(owner);
            setStatus(`Owner found for Token ID ${findOwnerTokenId}: ${owner}`);
        } catch (error) {
            console.error(error);
            setTokenOwner(null);
            setStatus("Owner not found for this Token ID. It may not exist.");
        }
    };





    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Product Traceablity DApp</h1>
            <p>{status}</p>

            {!walletAddress ? (
                <button onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <div>
                    <p>Connected: {walletAddress}</p>
                    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
                        <h2>Mint an NFT</h2>
                        <label>
                            Recipient Address:
                            <br />
                            <input
                                type="text"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                placeholder="0x..."
                                style={{ width: '300px', padding: '5px', margin: '5px 0' }}
                            />
                        </label>
                        <br />
                        <label>
                            Token URI:
                            <br />
                            <input
                                type="text"
                                value={tokenURI}
                                onChange={(e) => setTokenURI(e.target.value)}
                                placeholder="ipfs://..."
                                style={{ width: '300px', padding: '5px', margin: '5px 0' }}
                            />
                        </label>
                        <br />
                        <button onClick={handleMint} style={{ marginTop: '10px' }}>
                            Mint NFT
                        </button>
                    </div>

                    <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '10px' }}>
                        <h2>Find Token Owner</h2>
                        <label>
                            Token ID:
                            <br />
                            <input
                                type="text"
                                value={findOwnerTokenId}
                                onChange={(e) => setFindOwnerTokenId(e.target.value)}
                                placeholder="e.g., 0, 1, 2"
                                style={{ width: '300px', padding: '5px', margin: '5px 0' }}
                            />
                        </label>
                        <br />
                        <button onClick={findOwner} style={{ marginTop: '10px' }}>
                            Find Owner
                        </button>
                        {tokenOwner && (
                            <p style={{ marginTop: '10px' }}>
                                Owner of Token ID {findOwnerTokenId} is: <strong>{tokenOwner}</strong>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
