import chai from "chai";
import { ethers, waffle } from "hardhat";
import { solidity } from "ethereum-waffle";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import type { BuilderFiV1 } from "../../typechain-types";
import { Artifacts } from "../shared";

chai.use(solidity);

const { expect } = chai;
const { parseUnits } = ethers.utils;
const { deployContract } = waffle;

describe("BuilderFi", () => {
  let creator: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  let builderFi: BuilderFiV1;

  beforeEach(async () => {
    [creator, addr1, addr2] = await ethers.getSigners();
  });

  it("can be deployed", async () => {
    const action = deployContract(creator, Artifacts.BuilderFi, [creator.address, "TALMEMBERS1"]);

    await expect(action).not.to.be.reverted;
  });
});
