// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyNFT
 * @dev This is a simple ERC-721 contract for creating and minting NFTs.
 * It uses OpenZeppelin's battle-tested contracts for security and reliability.
 *
 * It includes `ERC721Enumerable` to allow for easy listing of all tokens in the collection.
 * The `Ownable` contract is used to restrict the minting function to only the contract owner.
 */
contract MyNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;

    // A mapping to store the token URI for each token ID.
    // This allows the NFT's metadata (like name, image, and description) to be set and retrieved.
    mapping(uint256 => string) private _tokenURIs;

    /**
     * @dev The constructor initializes the ERC-721 token with a name and a symbol.
     * It also sets the deployer of the contract as the owner.
     * @param name_ The name of the NFT collection.
     * @param symbol_ The symbol of the NFT collection.
     */
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {}

    /**
     * @dev The `_update` function needs to be explicitly overridden due to the multiple
     * inheritance of `ERC721` and `ERC721Enumerable`.
     * We call the `ERC721Enumerable` version as it contains the logic for both.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev The `_increaseBalance` function also needs to be explicitly overridden.
     * We call the `ERC721Enumerable` version.
     */
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     * This function is required by OpenZeppelin's ERC721Enumerable and ensures the contract
     * is compatible with the specified interfaces.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Mints a new NFT and assigns it to a specific address.
     * This function is restricted to the contract owner.
     * @param to The address that will receive the newly minted NFT.
     * @param tokenURI The URI that points to the metadata of the NFT.
     */
    function safeMint(address to, string memory tokenURI) public onlyOwner {
        // Increment the token counter to get a new, unique token ID.
        uint256 newItemId = _tokenIdCounter++;

        // Mint the new token to the recipient address.
        _safeMint(to, newItemId);

        // Set the token URI for the newly minted token.
        _setTokenURI(newItemId, tokenURI);
    }

    /**
     * @dev See {ERC721-tokenURI}.
     * This function overrides the default OpenZeppelin function to use our custom mapping.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
    /**
     * @dev Transfers a range of NFTs to a single recipient in a single transaction.
     * This function is restricted to the contract owner. It uses `try/catch` to handle
     * non-existent tokens gracefully without reverting the entire transaction.
     * @param to The address that will receive the NFTs.
     * @param startTokenId The starting token ID of the range (inclusive).
     * @param endTokenId The ending token ID of the range (inclusive).
     */
    function bulkTransfer(
        address to,
        uint256 startTokenId,
        uint256 endTokenId
    ) public onlyOwner {
        // Validate that the starting token ID is less than or equal to the ending token ID.
        require(startTokenId <= endTokenId, "Invalid token ID range");
        require(to != address(0), "Cannot transfer to the zero address");

        // Loop through each token ID in the specified range.
        for (uint256 i = startTokenId; i <= endTokenId; i++) {
            // Get the current owner of the token. We use a try/catch block to handle
            // cases where a token in the range does not exist gracefully.
            try this.ownerOf(i) returns (address currentOwner) {
                // If the token exists and the owner is not the zero address, transfer it.
                _safeTransfer(currentOwner, to, i, "");
            } catch {
                // If ownerOf reverts (because the token doesn't exist), we catch the error
                // and simply continue to the next iteration of the loop.
                continue;
            }
        }
    }

    /**
     * @dev Sets the token URI for a specific token ID.
     * This is a private helper function used by `safeMint`.
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }
}
