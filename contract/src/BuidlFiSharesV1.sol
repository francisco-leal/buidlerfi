pragma solidity >=0.8.2 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol"

contract BuidlerFiSharesV1 is Ownable {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;
    uint256 public hodlerFeePercent;

    event Trade(address trader, address subject, bool isBuy, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 hodlerEthAmount, uint256 supply);

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
        uint256 sum2 = supply == 0 && amount == 1 ? 0 : (supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }

    function getBuyPrice(address sharesSubject, uint256 amount) public view returns (uint256) {
        return getPrice(sharesSupply[sharesSubject], amount);
    }

    function getSellPrice(address sharesSubject, uint256 amount) public view returns (uint256) {
        return getPrice(sharesSupply[sharesSubject] - amount, amount);
    }

    function getBuyPriceAfterFee(address sharesSubject, uint256 amount) public view returns (uint256) {
        uint256 price = getBuyPrice(sharesSubject, amount);
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

    function buyShares(address sharesSubject, uint256 amount) public payable {
        uint256 supply = sharesSupply[sharesSubject];
        require(supply > 0 || sharesSubject == msg.sender, "Only the shares' subject can buy the first share");
        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 hodlerFee = price * hodlerFeePercent / 1 ether;
        require(msg.value >= price + protocolFee + subjectFee + hodlerFee, "Insufficient payment");

        uint256 balance = sharesBalance[sharesSubject][msg.sender];

        if (balance==0) {
            supporterNumber[sharesSubject][msg.sender] = supporterKeysArray[sharesSubject].length;
            supporterKeysArray[sharesSubject].push(amount);
            supporterAddressArray[sharesSubject].push(msg.sender);
        }

        else {
            supporterKeysArray[sharesSubject][supporterNumber[sharesSubject][msg.sender]] += amount;
        }

        sharesBalance[sharesSubject][msg.sender] += amount;
        sharesSupply[sharesSubject] = supply + amount;
        emit Trade(msg.sender, sharesSubject, true, amount, price, protocolFee, subjectFee, supply + amount);

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = sharesSubject.call{value: subjectFee}("");
        bool success3 = _distributeToHodlers(sharesSubject, hodlerFee);
        require(success1 && success2 && success3, "Unable to send funds");
    }

    function sellShares(address sharesSubject, uint256 amount) public payable {
        uint256 supply = sharesSupply[sharesSubject];
        require(supply > amount, "Cannot sell the last share");
        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 hodlerFee = price * hodlerFeePercent / 1 ether;

        require(sharesBalance[sharesSubject][msg.sender] >= amount, "Insufficient shares");

        uint256 balance = sharesBalance[sharesSubject][msg.sender];

        supporterKeysArray[sharesSubject][supporterNumber[sharesSubject][msg.sender]] -= amount;
        sharesBalance[sharesSubject][msg.sender] -= amount;
        sharesSupply[sharesSubject] = supply - amount;
        emit Trade(msg.sender, sharesSubject, false, amount, price, protocolFee, subjectFee, supply - amount);
        (bool success1, ) = msg.sender.call{value: price - protocolFee - subjectFee}("");
        (bool success2, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success3, ) = sharesSubject.call{value: subjectFee}("");
        bool success4 = _distributeToHodlers(sharesSubject, hodlerFee);

        require(success1 && success2 && success3 && success4, "Unable to send funds");
    }

    function _distributeToHodlers(address sharesSubject, hodlerFee) internal payable returns(bool) {
        (address[] memory addresses, uint256 number) = getAtMostTopTenSupporters(sharesSubject);

        // Edge case: somehow can't find a single hodler within 1000 range
        if(number==0) {
            (bool success, ) = protocolFeeDestination.call{value: hodlerFee}("");
            
            if(!success) revert();
        }

        else {
            uint256 feePerHodler = hodlerFee * 1e18 / number / 1e18;
            for(uint256 i=0; i<numbers;){
                (bool success, ) = addresses[i].call{value:feePerHodler}("");
                if(!success) revert();

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
        for(uint256 i=0;i<supporterKeysArray[sharesSubject];) {
            if(supporterKeysArray[i]!=0) {
                addresses[counter] = supporterAddressArray[i];
                counter++;
            }

            if(counter > 10 || i > 999) {
                break;
            }

            unchecked {
                ++i;
            }
        }

        return (addresses, counter);
    }
}