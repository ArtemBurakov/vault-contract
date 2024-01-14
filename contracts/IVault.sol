// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IVault {
    function deposit() external payable;
    function withdraw() external;
    function balances(address account) external view returns (uint256);
}

