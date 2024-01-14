// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IVault } from './IVault.sol';
import { IOwner } from './IOwner.sol';

contract Vault is IVault, IOwner {
    address public owner;
    uint256 public ownerIncome;
    uint256 public ownerIncomePercentage;

    mapping(address => bool) public locked;
    mapping(address => uint256) public balances;
    

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier noReentrant() {
        require(!locked[msg.sender], "Withdrawal is locked");
        locked[msg.sender] = true;
        _;
        locked[msg.sender] = false;
    }

  constructor(uint256 _ownerIncomePercentage) {
    owner = msg.sender;
    ownerIncomePercentage = _ownerIncomePercentage;
  }

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;
    }

    function withdraw() external noReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        uint256 commission;

        if (msg.sender != owner) {
            commission = (balance * ownerIncomePercentage) / 100;
        }

        (bool success, ) = msg.sender.call{value: balance - commission}("");
        require(success, "Withdrawal failed");

        if (commission > 0) {
            ownerIncome += commission;
        }

        balances[msg.sender] = 0;
    }

    function withdrawOwnerIncome() external onlyOwner noReentrant {
        require(ownerIncome > 0, "No owner income to withdraw");
        
        (bool success, ) = msg.sender.call{value: ownerIncome}("");
        require(success, "Withdrawal failed");

        ownerIncome = 0;
    }
}