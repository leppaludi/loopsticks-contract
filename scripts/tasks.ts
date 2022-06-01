import { task } from "hardhat/config";
import { getEnvVariable } from "./helpers";

task("minters", "get list of loopstick minters").setAction(async function (
  taskArguments,
  hre
) {
  const LoopSticks = await hre.ethers.getContractFactory("LoopSticks");
  const contract = LoopSticks.attach(getEnvVariable("CONTRACT_ADDRESS"));

  const response = await contract.minters();
  console.log(response);
});

task("seturl", "Updates the contract base URL")
  .addParam("url", "Base URL")
  .setAction(async function (taskArguments, hre) {
    const LoopSticks = await hre.ethers.getContractFactory("LoopSticks");
    const contract = LoopSticks.attach(getEnvVariable("CONTRACT_ADDRESS"));

    const transactionResponse = await contract.setBaseURI(taskArguments.url, {
      gasLimit: 500_000,
    });
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("verify2", "Verify the contract on etherscan").setAction(async function (
  _,
  hre
) {
  const contractAddress = getEnvVariable("CONTRACT_ADDRESS");
  const layer2Address = getEnvVariable("LAYER2_ADDRESS");

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [layer2Address],
  });
});
