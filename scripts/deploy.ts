// We import the 'ethers' library from 'hardhat' and define its type.
import { ethers } from "hardhat";
// We now assume the contract name is "NFTCreator"
import { MyNFT } from "../typechain-types/contracts/NFTcreator.sol"
// The main function for deployment. We use the 'async' keyword
// to allow for the use of 'await'.
async function main() {
    // Get the contract factory for the NFTCreator contract.
    const myNftFactory = await ethers.getContractFactory("MyNFT");

    console.log("Deploying contract...");

    // Deploy the contract with the correct constructor arguments.
    const myNft: MyNFT = await myNftFactory.deploy(
        "My Awesome NFT", // Replace with your desired contract name
        "MAN" // Replace with your desired contract symbol
    );

    // Wait for the contract to be deployed and confirmed on the network.
    await myNft.waitForDeployment();

    // Get and log the address of the deployed contract.
    const contractAddress = await myNft.getAddress();
    console.log("Contract deployed to:", contractAddress);
}

// We call the main function and handle any potential errors during deployment.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
