// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity =0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Ownable.sol";

contract RewardToken is ERC20, Ownable {

    mapping(address => uint) public minters;
    event SetMinter(address indexed minter, uint amount);

    constructor () ERC20("RewardToken", "rToken") {
    }

    function setMinter(address minter, uint amount) external onlyOwner {
        minters[minter] = amount;
        emit SetMinter(minter, amount);
    }

    function mint(address to, uint amount) external onlyOwner{
        require(amount <= minters[msg.sender], "cCRV: insufficient mint allowance");
        minters[msg.sender] -= amount;
        _mint(to, amount);
    }
}
   