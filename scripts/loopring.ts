/* eslint-disable no-template-curly-in-string */

import * as sdk from "../loopring_sdk/src";
import { task } from "hardhat/config";
import {
  calculateTokenId,
  calculateTokenIdHex,
  getEnvVariable,
} from "./helpers";
import Web3 from "web3";
import BN from "bn.js";
import {
  AmmpoolAPI,
  DelegateAPI,
  ExchangeAPI,
  GlobalAPI,
  NFTAPI,
  UserAPI,
  WalletAPI,
  WhitelistedUserAPI,
  WsAPI,
  generateKeyPair,
} from "../loopring_sdk/src";
import { BigNumber } from "ethers";

const chainId = sdk.ChainId.GOERLI;

export const LoopringAPI = {
  userAPI: new UserAPI({ chainId }),
  exchangeAPI: new ExchangeAPI({ chainId }),
  globalAPI: new GlobalAPI({ chainId }),
  ammpoolAPI: new AmmpoolAPI({ chainId }),
  walletAPI: new WalletAPI({ chainId }),
  wsAPI: new WsAPI({ chainId }),
  whitelistedUserAPI: new WhitelistedUserAPI({ chainId }),
  nftAPI: new NFTAPI({ chainId }),
  delegate: new DelegateAPI({ chainId }),
  __chainId__: chainId,
};

async function signatureKeyPairMock(accInfo: sdk.AccountInfo, _web3: Web3) {
  const eddsaKey = await generateKeyPair({
    web3: _web3,
    address: accInfo.owner,
    keySeed: accInfo.keySeed,
    walletType: sdk.ConnectorNames.PrivateKey,
    privateKey: getEnvVariable("PRIVATE_KEY"),
    chainId: sdk.ChainId.GOERLI,
  });
  return eddsaKey;
}

task("mint", "mint using loopring")
  .addParam("id", "token #")
  .setAction(async function (taskArguments, { web3 }) {
    const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
      owner: getEnvVariable("ADDRESS"),
    });
    console.log("accInfo:", accInfo);

    const eddsaKey = await signatureKeyPairMock(accInfo, web3);
    console.log("eddsaKey:", eddsaKey.sk);

    const { apiKey } = await LoopringAPI.userAPI.getUserApiKey(
      {
        accountId: accInfo.accountId,
      },
      eddsaKey.sk
    );
    console.log("apiKey:", apiKey);

    const fee = await LoopringAPI.userAPI.getNFTOffchainFeeAmt(
      {
        accountId: accInfo.accountId,
        tokenAddress: getEnvVariable("CONTRACT_ADDRESS"),
        requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
      },
      apiKey
    );

    const feeTokenId = (fee.fees.LRC as any).tokenId;

    console.log("fee:", fee);

    const storageId = await LoopringAPI.userAPI.getNextStorageId(
      {
        accountId: accInfo.accountId,
        sellTokenId: feeTokenId,
      },
      apiKey
    );

    console.log("storageId:", storageId);

    const tokenId = calculateTokenIdHex("1234520220531", 0, taskArguments.id);

    // const tokenIdBn = BigNumber.from(tokenId);
    // const tokenIdHex = tokenIdBn.toHexString();

    // console.log(tokenId);
    // console.log(tokenIdHex);

    // return;

    const response = await LoopringAPI.userAPI.submitNFTMint({
      request: {
        exchange: getEnvVariable("LAYER2_ADDRESS"),
        minterId: accInfo.accountId,
        minterAddress: accInfo.owner,
        toAccountId: accInfo.accountId,
        toAddress: accInfo.owner,
        nftType: 0,
        tokenAddress: getEnvVariable("CONTRACT_ADDRESS"),
        nftId: "0x" + tokenId,
        amount: "1",
        validUntil: Math.round(Date.now() / 1000) + 30 * 86400,
        storageId: storageId.offchainId ?? 9,
        maxFee: {
          tokenId: feeTokenId,
          amount: (fee.fees.LRC as any).fee ?? "9400000000000000000",
        },
        royaltyPercentage: 5,
        // counterFactualNftInfo,
        forceToMint: false, // suggest use as false, for here is just for run test
      },
      web3,
      chainId: sdk.ChainId.GOERLI,
      walletType: sdk.ConnectorNames.PrivateKey,
      eddsaKey: eddsaKey.sk,
      apiKey: apiKey,
      privateKey: getEnvVariable("PRIVATE_KEY"),
    });

    console.log("response:", JSON.stringify(response));
  });

async function main() {}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
