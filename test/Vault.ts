import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import * as dotenv from "dotenv";
dotenv.config();

const OWNER_INCOME_PERCENTAGE = process.env.OWNER_INCOME_PERCENTAGE;
// @ts-ignore
const COMMISSION_PERCENTAGE = BigInt(OWNER_INCOME_PERCENTAGE);

const PRECISION = 1000000000000000;
const TEST_ETHER_AMOUNT = ethers.parseUnits("5", "ether");

describe("Vault", function () {
  async function deployVaultContract() {
    const [owner, userAccount] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault");
    // @ts-ignore
    const vault = await Vault.deploy(OWNER_INCOME_PERCENTAGE);

    return { vault, owner, userAccount };
  }

  describe("Deployment", function () {
    describe("Owner", function () {
      it("Should set the owner to the deployer's address after deployment", async function () {
        const { vault, owner } = await loadFixture(deployVaultContract);

        expect(await vault.owner()).to.equal(owner.address);
      });
    });
    describe("Owner Income Percentage", function () {
      it("Should set the income percentage after deployment", async function () {
        const { vault } = await loadFixture(deployVaultContract);

        expect(await vault.ownerIncomePercentage()).to.equal(OWNER_INCOME_PERCENTAGE);
      });
    });
  });

  describe("Deposit", function () {
    describe("Balance Increase", function () {
      it("Should increase the depositor's balance by the deposited amount", async function () {
        const { vault, userAccount } = await loadFixture(deployVaultContract);

        const initialBalance = await vault.balances(userAccount.address);
        await vault.connect(userAccount).deposit({ value: TEST_ETHER_AMOUNT });

        expect(await vault.balances(userAccount.address)).to.equal(initialBalance + TEST_ETHER_AMOUNT);
      });
    });

    describe("Zero Deposit", function () {
      it("Should revert if the deposit amount is 0", async function () {
        const { vault, userAccount } = await loadFixture(deployVaultContract);

        await expect(vault.connect(userAccount).deposit({ value: 0 })).to.be.revertedWith("Deposit amount must be greater than 0");
      });
    });
  });

  describe("Withdraw", function () {
    describe("User Withdrawals", function () {
      it("Should reduce user balance and send funds with commission after withdrawal", async function () {
        const { vault, userAccount } = await loadFixture(deployVaultContract);

        await vault.connect(userAccount).deposit({ value: TEST_ETHER_AMOUNT });

        const initialUserBalance = await ethers.provider.getBalance(userAccount.address);
        const initialContractBalance = await vault.balances(userAccount.address);

        const expectedCommission = (initialContractBalance * COMMISSION_PERCENTAGE) / 100n;
        const expectedWithdrawalAmount = initialContractBalance - expectedCommission;

        await vault.connect(userAccount).withdraw();

        expect(await ethers.provider.getBalance(userAccount.address)).to.be.closeTo(initialUserBalance + expectedWithdrawalAmount, PRECISION);
        expect(await vault.balances(userAccount.address)).to.equal(0);
      });

      it("Should correctly calculate owner income after user withdrawal", async function () {
        const { vault, userAccount } = await loadFixture(deployVaultContract);

        await vault.connect(userAccount).deposit({ value: TEST_ETHER_AMOUNT });

        const contractBalanceAfterDeposit = await vault.balances(userAccount.address);
        const expectedOwnerIncome = (contractBalanceAfterDeposit * COMMISSION_PERCENTAGE) / 100n;

        await vault.connect(userAccount).withdraw();

        expect(await vault.ownerIncome()).to.equal(expectedOwnerIncome);
      });

      it("Should revert if the user has no balance to withdraw", async function () {
        const { vault, userAccount } = await loadFixture(deployVaultContract);

        await expect(vault.connect(userAccount).withdraw()).to.be.revertedWith("No balance to withdraw");
      });
    });

    describe("Owner Withdrawals", function () {
      it("Owner should be able to withdraw without commission", async function () {
        const { vault, owner } = await loadFixture(deployVaultContract);

        const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

        await vault.connect(owner).deposit({ value: TEST_ETHER_AMOUNT });
        await vault.connect(owner).withdraw();

        expect(await ethers.provider.getBalance(owner.address)).to.be.closeTo(initialOwnerBalance, PRECISION);
        expect(await vault.balances(owner.address)).to.equal(0);
      });

      it("Should revert if the owner has no balance to withdraw", async function () {
        const { vault, owner } = await loadFixture(deployVaultContract);

        await expect(vault.connect(owner).withdraw()).to.be.revertedWith("No balance to withdraw");
      });
    });

    describe("Owner Income Withdrawals", function () {
      it("Owner should be able to withdraw their income and update their balance", async function () {
        const { vault, owner, userAccount } = await loadFixture(deployVaultContract);

        const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

        await vault.connect(userAccount).deposit({ value: TEST_ETHER_AMOUNT });
        await vault.connect(userAccount).withdraw();

        const accruedOwnerIncome = await vault.ownerIncome();
        await vault.connect(owner).withdrawOwnerIncome();

        expect(await ethers.provider.getBalance(owner.address)).to.be.closeTo(initialOwnerBalance + accruedOwnerIncome, PRECISION);
        expect(await vault.ownerIncome()).to.equal(0);
      });

      it("Should revert if there's no income to withdraw for the owner", async function () {
        const { vault, owner } = await loadFixture(deployVaultContract);

        await expect(vault.connect(owner).withdrawOwnerIncome()).to.be.revertedWith("No owner income to withdraw");
      });

      it("Should revert if a non-owner attempts to withdraw owner income", async function () {
        const { vault, userAccount } = await loadFixture(deployVaultContract);

        await expect(vault.connect(userAccount).withdrawOwnerIncome()).to.be.revertedWith("Not the owner");
      });
    });
  });
});
