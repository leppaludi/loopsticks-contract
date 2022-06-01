import { task } from "hardhat/config";
import { calculateTokenId } from "./helpers";

const path = require("path");
const fs = require("fs");

task("metadata", "make some metadata").setAction(async function (
  taskArguments,
  hre
) {
  const contractId = "1234520220531";

  for (let i = 1; i !== 51; i++) {
    const tokenId = calculateTokenId(contractId, 0, i);

    const metadata = {
      name: `LoopStick #${i}`,
      description: "The LoopSticks are simple.",
      external_link: null,
      image: `ipfs://QmR5daTUnPKaQ4WA9npmtcY8vyTYLxktKAoRYQys9kHWii/${i}.png`,
      attributes: {},
    };

    fs.writeFileSync(
      path.join(__dirname, "..", "metadata", contractId, tokenId),
      JSON.stringify(metadata)
    );
  }
});
