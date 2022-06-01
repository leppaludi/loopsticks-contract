import { ethers } from "hardhat";

const { LAYER2_ADDRESS } = process.env;

async function main() {
  if (LAYER2_ADDRESS) {
    const LoopSticks = await ethers.getContractFactory("LoopSticks");
    const deployment = await LoopSticks.deploy(LAYER2_ADDRESS);

    await deployment.deployed();

    console.log("LoopSticks deployed to:", deployment.address);
  } else {
    console.error("Layer 2 address missing");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
