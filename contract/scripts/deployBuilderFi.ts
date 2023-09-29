import { ethers, upgrades } from "hardhat";
import type { BuilderFiV1 } from "../typechain-types";

const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log(creator.address);

  const BuilderFiV1Factory = await ethers.getContractFactory("BuilderFiV1");
  const builderFi = (await upgrades.deployProxy(BuilderFiV1Factory, [])) as BuilderFiV1;

  console.log("BuilderFi address is: ", builderFi.address);
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
