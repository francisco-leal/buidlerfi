// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19 <0.9.0;

import { console2 } from "forge-std/console2.sol";
import { StdCheats } from "forge-std/StdCheats.sol";
import "forge-std/Test.sol";
import "forge-std/Vm.sol";

import { BuidlerFiSharesV1 } from "../src/BuidlerFiSharesV1.sol";

/// @dev If this is your first time with Forge, read this tutorial in the Foundry Book:
/// https://book.getfoundry.sh/forge/writing-tests
contract BuidlerFiSharesV1Test is StdCheats, Test {
    BuidlerFiSharesV1 public sharesContract;

    /// @dev A function invoked before each test case is run.
    function setUp() public virtual {
        // Instantiate the contract-under-test.
        sharesContract = new BuidlerFiSharesV1();
        sharesContract.setFeeDestination(address(0x99));
        sharesContract.setHodlerFeePercent(5e16); // 5%
        sharesContract.setProtocolFeePercent(5e16); // 5%
        sharesContract.setSubjectFeePercent(5e16); // 5%
    }

    function test_InitialState() external {
        assertEq(sharesContract.protocolFeeDestination(), address(0x99), "value mismatch");
        assertEq(sharesContract.hodlerFeePercent(), 5e16, "value mismatch");
        assertEq(sharesContract.protocolFeePercent(), 5e16, "value mismatch");
        assertEq(sharesContract.subjectFeePercent(), 5e16, "value mismatch");

    }

    function test_SuccessfulInitialBuySingleKey() external {
        vm.startPrank(address(0x1));
        uint256 buyPrice = sharesContract.getBuyPriceAfterFee(address(0x1));
        vm.deal(address(0x1), buyPrice);
        sharesContract.buyShares{value: 0}(address(0x1));
        assertEq(sharesContract.supporterAddressArray(address(0x1),0), address(0x1), "Array not updated");
        vm.stopPrank();
    }

    function test_SuccessfulInitialBuyMultipleKeys() external {
        vm.startPrank(address(0x1));
        uint256 buyPrice = sharesContract.getBuyPriceAfterFee(address(0x1));
        vm.deal(address(0x1), buyPrice);
        sharesContract.buyShares{value: buyPrice}(address(0x1));
        assertEq(sharesContract.supporterAddressArray(address(0x1),0), address(0x1), "Array not updated");
        vm.stopPrank();
    }

    function test_UnsuccessfulInitialBuy_FirstShareByNonOwner() external {
        vm.startPrank(address(0x1));
        uint256 buyPrice = sharesContract.getBuyPriceAfterFee(address(0x1));
        vm.deal(address(0x1), buyPrice);
        vm.expectRevert();
        sharesContract.buyShares{value: buyPrice}(address(0x2));
        vm.stopPrank();
    }

    function test_SupporterNumber() external {
        vm.startPrank(address(0x1));
        uint256 buyPrice1 = sharesContract.getBuyPriceAfterFee(address(0x1));
        vm.deal(address(0x1), buyPrice1);
        sharesContract.buyShares{value:buyPrice1}(address(0x1));
        vm.stopPrank();
        vm.startPrank(address(0x2));
        uint256 buyPrice2 = sharesContract.getBuyPriceAfterFee(address(0x1));
        vm.deal(address(0x2), buyPrice2);
        sharesContract.buyShares{value:buyPrice2}(address(0x1));
        vm.stopPrank();
        vm.startPrank(address(0x3));
        uint256 buyPrice3 = sharesContract.getBuyPriceAfterFee(address(0x1));
        vm.deal(address(0x3), buyPrice3);
        sharesContract.buyShares{value:buyPrice3}(address(0x1));
        vm.stopPrank();
        assertEq(sharesContract.supporterAddressArray(address(0x1),0), address(0x1), "Array not updated");
        assertEq(sharesContract.supporterAddressArray(address(0x1),1), address(0x2), "Array not updated");
        assertEq(sharesContract.supporterAddressArray(address(0x1),2), address(0x3), "Array not updated");

        assertEq(sharesContract.supporterKeysArray(address(0x1),0), 1, "Array not updated");
        assertEq(sharesContract.supporterKeysArray(address(0x1),1), 1, "Array not updated");
        assertEq(sharesContract.supporterKeysArray(address(0x1),2), 1, "Array not updated");
    }

    function test_getTopNHodlers() external {
        for(uint256 i=1;i<10;i++) {
            vm.startPrank(address(uint160(i)));
            uint256 buyPrice = sharesContract.getBuyPriceAfterFee(address(0x1));
            vm.deal(address(uint160(i)), buyPrice);
            sharesContract.buyShares{value:buyPrice}(address(0x1));
            vm.stopPrank();
        }

        (address[] memory addresses,uint256 number) = sharesContract.getAtMostTopTenSupporters(address(0x1));
        assertEq(addresses[0], address(0x1), "Invalid address");
        assertEq(addresses[4], address(0x5), "Invalid address");
        assertEq(addresses[8], address(uint160(9)), "Invalid address");
        assertEq(number, 9, "Invalid N");
    }
}
