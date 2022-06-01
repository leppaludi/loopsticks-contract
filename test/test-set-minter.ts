import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

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

  it("Should have to be owner to set minter", async function () {
    await expect(
      contract.connect(address1).setMinter(address1.address, true)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should be able to set and unset minter", async function () {
    expect(await contract.minters()).to.eql([owner.address]);

    await contract.setMinter(address1.address, true);

    expect(await contract.minters()).to.eql([address1.address, owner.address]);

    await contract.setMinter(address1.address, false);

    // Still a minter, deprecated
    expect(await contract.minters()).to.eql([address1.address, owner.address]);
  });
});
