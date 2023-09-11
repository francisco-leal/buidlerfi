// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19 <=0.9.0;

import { BuidlerFiSharesV1 } from "../src/BuidlerFiSharesV1.sol";

import { BaseScript } from "./Base.s.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract Deploy is BaseScript {
    function run() public broadcast returns (BuidlerFiSharesV1 buidlerFiSharesV1) {
        buidlerFiSharesV1 = new BuidlerFiSharesV1();
    }
}
