// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.19;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BuidlerFiSharesV1 is Ownable {
    error FundsTransferFailed();
    error OnlySharesSubjectCanBuyFirstShare();
    error CannotSellLastShare();
    error InsufficientPayment();
    error InsufficientShares();

    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;
    uint256 public hodlerFeePercent;

    event Trade(
        address trader, 
        address subject, 
        bool isBuy, 
        uint256 shareAmount, 
        uint256 ethAmount, 
        uint256 protocolEthAmount,
        uint256 subjectEthAmount, 
        uint256 hodlerEthAmount, 
        uint256 supply
    );

    // SharesSubject => (Hodler => SupporterNumber)
    mapping(address => mapping(address=>uint256)) public supporterNumber;

    // SharesSubject => NumKeysOwnedAtSupporterNumber[]
    mapping(address => uint256[]) public supporterKeysArray;
    
    // SharesSubject => HolderAtSupporterNumber[]
    mapping(address => address[]) public supporterAddressArray;

    // SharesSubject => (Holder => Balance)
    mapping(address => mapping(address => uint256)) public sharesBalance;

    // SharesSubject => Supply
    mapping(address => uint256) public sharesSupply;

    function setFeeDestination(address _feeDestination) public onlyOwner {
        protocolFeeDestination = _feeDestination;
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        protocolFeePercent = _feePercent;
    }

    function setSubjectFeePercent(uint256 _feePercent) public onlyOwner {
        subjectFeePercent = _feePercent;
    }

    function setHodlerFeePercent(uint256 _feePercent) public onlyOwner {
        hodlerFeePercent = _feePercent;
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = supply == 0 ? 0 : (supply - 1 )* (supply) * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = supply == 0 && amount == 1 
        ? 
        0 : 
        (supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }

    function getBuyPrice(address sharesSubject) public view returns (uint256) {
        return getPrice(sharesSupply[sharesSubject], 1);
    }

    function getSellPrice(address sharesSubject, uint256 amount) public view returns (uint256) {
        return getPrice(sharesSupply[sharesSubject] - amount, amount);
    }

    function getBuyPriceAfterFee(address sharesSubject) public view returns (uint256) {
        uint256 price = getBuyPrice(sharesSubject);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 hodlerFee = price * hodlerFeePercent / 1 ether;
        return price + protocolFee + subjectFee + hodlerFee;
    }

    function getSellPriceAfterFee(address sharesSubject, uint256 amount) public view returns (uint256) {
        uint256 price = getSellPrice(sharesSubject, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 hodlerFee = price * hodlerFeePercent / 1 ether;
        return price - protocolFee - subjectFee - hodlerFee;
    }

    /// @notice Can only buy one share at a time
    function buyShares(address sharesSubject) public payable {
        uint256 supply = sharesSupply[sharesSubject];
        if(supply == 0 && sharesSubject != msg.sender) revert OnlySharesSubjectCanBuyFirstShare();
        uint256 price = getPrice(supply, 1);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 hodlerFee = price * hodlerFeePercent / 1 ether;
        if(msg.value < price + protocolFee + subjectFee + hodlerFee) revert InsufficientPayment();

        uint256 initialBalance = sharesBalance[sharesSubject][msg.sender];
        
        sharesBalance[sharesSubject][msg.sender]++;
        sharesSupply[sharesSubject]++;
        emit Trade(
            msg.sender, 
            sharesSubject, 
            true, 
            1, 
            price, 
            protocolFee, 
            subjectFee, 
            hodlerFee,
            supply + 1
        );

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = sharesSubject.call{value: subjectFee}("");
        bool success3 = _distributeToHodlers(sharesSubject, hodlerFee);

        if(!(success1 && success2 && success3)) revert FundsTransferFailed();

        if (initialBalance==0) {
            supporterNumber[sharesSubject][msg.sender] = supporterKeysArray[sharesSubject].length;
            supporterKeysArray[sharesSubject].push(1);
            supporterAddressArray[sharesSubject].push(msg.sender);
        } else {
            supporterKeysArray[sharesSubject][supporterNumber[sharesSubject][msg.sender]]++;
        }
    }

    function sellShares(address sharesSubject, uint256 amount) public payable {
        uint256 supply = sharesSupply[sharesSubject];
        if(supply <= amount) revert CannotSellLastShare();
        if(sharesBalance[sharesSubject][msg.sender] < amount) revert InsufficientShares();

        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 hodlerFee = price * hodlerFeePercent / 1 ether;

        supporterKeysArray[sharesSubject][supporterNumber[sharesSubject][msg.sender]] -= amount;
        sharesBalance[sharesSubject][msg.sender] -= amount;
        sharesSupply[sharesSubject] = supply - amount;
        emit Trade(
            msg.sender, 
            sharesSubject, 
            false, 
            amount, 
            price, 
            protocolFee, 
            subjectFee, 
            hodlerFee, 
            supply - amount
        );
        (bool success1, ) = msg.sender.call{value: price - protocolFee - subjectFee - hodlerFee}("");
        (bool success2, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success3, ) = sharesSubject.call{value: subjectFee}("");
        bool success4 = _distributeToHodlers(sharesSubject, hodlerFee);

        if(!(success1 && success2 && success3 && success4)) revert FundsTransferFailed();
    }

    function _distributeToHodlers(address sharesSubject, uint256 hodlerFee) internal returns(bool) {
        (address[] memory addresses, uint256 number) = getAtMostTopTenSupporters(sharesSubject);

        // Edge case: somehow can't find a single hodler within 1000 range
        if(number==0) {
            (bool success, ) = protocolFeeDestination.call{value: hodlerFee}("");
            
            if(!success) revert FundsTransferFailed();
        }

        else {
            uint256 feePerHodler = hodlerFee * 1e18 / number / 1e18;
            for(uint256 i=0; i<number;){
                (bool success, ) = addresses[i].call{value:feePerHodler}("");
                if(!success) revert FundsTransferFailed();

                unchecked {
                    ++i;
                }
            }
        }
        return true;
    }

    function getAtMostTopTenSupporters(address sharesSubject) public view returns(address[] memory,uint256) {
        address[] memory addresses = new address[](10);
        uint256 counter = 0;
        uint256 length = supporterKeysArray[sharesSubject].length;
        for(uint256 i=0;i<length;) {
            if(supporterKeysArray[sharesSubject][i]!=0) {
                addresses[counter] = supporterAddressArray[sharesSubject][i];
                counter++;
            }

            if(counter > 9 || i > 999) {
                break;
            }

            unchecked {
                ++i;
            }
        }

        return (addresses, counter);
    }
}
