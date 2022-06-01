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

  it("Should have to be minter to mint", async function () {
    await expect(
      contract.connect(address1).mint(address1.address, 0, 2, "0x")
    ).to.be.revertedWith("not authorized");
  });

  it("Should be able to mint as owner", async function () {
    await contract.setBaseURI("asdf://");

    const tx = await contract.mint(address1.address, 0, 2, "0x", {
      from: owner.address,
    });

    // const receipt = await tx.wait();

    // for (const event of receipt.events) {
    //   console.log(`Event ${event.event} with args ${event.args}`);
    // }

    await expect(tx)
      .to.emit(contract, "TransferSingle")
      .withArgs(
        owner.address,
        ethers.constants.AddressZero,
        address1.address,
        0,
        2
      );

    expect(await contract.uri(0)).to.equal("asdf://0");
    expect(await contract.uri(1)).to.equal("asdf://1");
  });

  it("Should be able to mint as minter but not as deprecated minter", async function () {
    await contract.setBaseURI("asdf://");
    await contract.setMinter(address1.address, true);

    await contract.connect(address1).mint(address1.address, 0, 2, "0x");

    expect(await contract.uri(0)).to.equal("asdf://0");
    expect(await contract.uri(1)).to.equal("asdf://1");

    await contract.setMinter(address1.address, false);

    // Deprecated
    await expect(
      contract.connect(address1).mint(address1.address, 0, 2, "0x")
    ).to.be.revertedWith("not authorized");
  });
});
