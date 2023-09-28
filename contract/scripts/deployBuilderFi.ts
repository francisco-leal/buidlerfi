import { ethers, upgrades } from "hardhat";
import type { BuidlerFiSharesV1 } from "../typechain-types";

const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log(creator.address);

  const BuidlerFiSharesV1Factory = await ethers.getContractFactory("BuidlerFiSharesV1");
  const builderFi = (await upgrades.deployProxy(BuidlerFiSharesV1Factory, [])) as BuidlerFiSharesV1;

  console.log("BuilderFi address is: ", builderFi.address);
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
