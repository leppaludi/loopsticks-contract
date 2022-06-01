import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, BigNumber } from "ethers";
import { calculateTokenId } from "../scripts/helpers";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoopSticks", function () {
  let contract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;

  beforeEach(async () => {
    const Contract = await ethers.getContractFactory("LoopSticks");
    [owner, address1] = await ethers.getSigners();
    contract = await Contract.deploy(
      "0x0baba1ad5be3a5c0a66e7ac838a129bf948f1ea4"
    );
    await contract.deployed();
  });

  it("Should deploy contract", async function () {
    expect(await contract.layer2Address()).to.equal(
      "0x0BABA1Ad5bE3a5C0a66E7ac838a129Bf948f1eA4"
    );
  });

  it("Should set the right owner", async () => {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should have to be owner to set base url", async function () {
    await expect(
      contract.connect(address1).setBaseURI("asdf")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should be able to set base url", async function () {
    const tokenId1 = calculateTokenId("1234520220531", 0, 0);
    const tokenId2 = calculateTokenId("1234520220531", 0, 1);

    await contract.mint(address1.address, tokenId1, 1, "0x", {
      from: owner.address,
    });
    await contract.mint(address1.address, tokenId2, 1, "0x", {
      from: owner.address,
    });

    expect(await contract.uri(tokenId1)).to.equal("");
    expect(await contract.uri(tokenId2)).to.equal("");

    await contract.setBaseURI("asdf://");

    expect(await contract.uri(tokenId1)).to.equal(
      "asdf://25373197401399029063620057199674420761722880"
    );
    expect(await contract.uri(tokenId2)).to.equal(
      "asdf://25373197401399029063620057199674420761722881"
    );
  });

  it("Should have to be owner to transfer ownership", async function () {
    await expect(
      contract.connect(address1).transferOwnership(address1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should be able to transfer ownership", async function () {
    expect(await contract.owner()).to.equal(owner.address);
    await contract.transferOwnership(address1.address);
    expect(await contract.owner()).to.equal(address1.address);
  });
});
