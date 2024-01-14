import { ethers } from "hardhat";

import * as dotenv from "dotenv";
dotenv.config();

const OWNER_INCOME_PERCENTAGE = process.env.OWNER_INCOME_PERCENTAGE;

async function main() {
  const vault = await ethers.deployContract("Vault", [OWNER_INCOME_PERCENTAGE]);

  await vault.waitForDeployment();

  console.log(`Vault deployed to ${vault.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
