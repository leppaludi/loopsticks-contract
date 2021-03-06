// SPDX-License-Identifier: Apache-2.0
// Copyright 2017 Loopring Technology Limited.

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./AddressSet.sol";
import "./external/IL2MintableNFT.sol";


/**
 * @title LoopSticks
 */
contract LoopSticks is ERC1155, Ownable, IL2MintableNFT, AddressSet
{
    using Strings for uint;

    event MintFromL2(
        address owner,
        uint256 id,
        uint    amount,
        address minter
    );

    bytes32 internal constant MINTERS = keccak256("__MINTERS__");
    bytes32 internal constant DEPRECATED_MINTERS = keccak256("__DEPRECATED_MINTERS__");

    address public immutable layer2Address;

    modifier onlyFromLayer2
    {
        require(msg.sender == layer2Address, "not authorized");
        _;
    }

    modifier onlyFromMinter
    {
        require(isMinter(msg.sender), "not authorized");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _layer2Address)
        ERC1155("")
    {
        layer2Address = _layer2Address;
    }

    function setBaseURI(string memory _uri) external onlyOwner {
        _setURI(_uri);
    }

    function mint(
        address       account,
        uint256       id,
        uint256       amount,
        bytes  memory data
        )
        external
        onlyFromMinter
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address          to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes     memory data
        )
        external
        onlyFromMinter
    {
        _mintBatch(to, ids, amounts, data);
    }

    function setMinter(
        address minter,
        bool enabled
        )
        external
        onlyOwner
    {
        if (enabled) {
            addAddressToSet(MINTERS, minter, true);
            if (isAddressInSet(DEPRECATED_MINTERS, minter)) {
                removeAddressFromSet(DEPRECATED_MINTERS, minter);
            }
        } else {
            removeAddressFromSet(MINTERS, minter);
            if (!isAddressInSet(DEPRECATED_MINTERS, minter)) {
                addAddressToSet(DEPRECATED_MINTERS, minter, true);
            }
        }
    }

    function transferOwnership(address newOwner)
        public
        virtual
        override
        onlyOwner
    {
        require(newOwner != owner(), "INVALID_OWNER");
        // Make sure NFTs minted by the previous owner remain valid
        if (!isAddressInSet(DEPRECATED_MINTERS, owner())) {
            addAddressToSet(DEPRECATED_MINTERS, owner(), true);
        }
        // Now transfer the ownership like usual
        super.transferOwnership(newOwner);
    }

    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory baseURI = super.uri(tokenId);

        if (bytes(baseURI).length == 0) {
            return "";
        } else {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        }
    }

    // Layer 2 logic

    function mintFromL2(
        address          to,
        uint256          id,
        uint             amount,
        address          minter,
        bytes   calldata data
        )
        external
        override
        onlyFromLayer2
    {
        require(isMinter(minter) || isAddressInSet(DEPRECATED_MINTERS, minter), "invalid minter");

        _mint(to, id, amount, data);
        emit MintFromL2(to, id, amount, minter);
    }

    function minters()
        public
        view
        override
        returns (address[] memory)
    {
        address[] memory minterAddresses = addressesInSet(MINTERS);
        address[] memory deprecatedAddresses = addressesInSet(DEPRECATED_MINTERS);
        address[] memory mintersAndOwner = new address[](minterAddresses.length + deprecatedAddresses.length + 1);
        uint idx = 0;
        for (uint i = 0; i < minterAddresses.length; i++) {
            mintersAndOwner[idx++] = minterAddresses[i];
        }
	    for (uint i = 0; i < deprecatedAddresses.length; i++) {
            mintersAndOwner[idx++] = deprecatedAddresses[i];
        }
        // Owner could already be added to the minters, but that's fine
        mintersAndOwner[idx++] = owner();
        return mintersAndOwner;
    }

    function isMinter(address addr)
        public
        view
        returns (bool)
    {
        // Also allow the owner to mint NFTs to save on gas (no additional minter needs to be set)
        return addr == owner() || isAddressInSet(MINTERS, addr);
    }
}
