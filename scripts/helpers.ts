import BigNumber from "bignumber.js";

// Helper method for fetching environment variables from .env
export function getEnvVariable(
  key: string,
  defaultValue: string | undefined = undefined
): string {
  if (process.env[key]) {
    return process.env[key] || "";
  }
  if (!defaultValue) {
    // eslint-disable-next-line no-throw-literal
    throw `${key} is not defined and no default value was provided`;
  }
  return defaultValue;
}

export function calculateTokenIdHex(
  contractId: string,
  collectionId: number,
  tokenId: number
) {
  const hex1 = new BigNumber(collectionId).toString(16);
  const hex3 = new BigNumber(tokenId).toString(16);

  const pad1 = 8 - hex1.length;
  const pad2 = 32 - contractId.length;
  const pad3 = 24 - hex3.length;

  const hexStr =
    "0".repeat(pad1) +
    hex1 +
    "0".repeat(pad2) +
    contractId +
    "0".repeat(pad3) +
    hex3;
  return hexStr;
}

export function calculateTokenId(
  contractId: string,
  collectionId: number,
  tokenId: number
) {
  const bn = new BigNumber(
    calculateTokenIdHex(contractId, collectionId, tokenId),
    16
  );
  return bn.toString(10);
}

module.exports = {
  getEnvVariable,
  calculateTokenId,
  calculateTokenIdHex,
};
