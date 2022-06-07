// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity =0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Ownable.sol";

contract Token is ERC20, Ownable {

    constructor () ERC20("Token Name", "Symbol") {
    }

    function mint(address to, uint amount) external onlyOwner{
        _mint(to, amount);
    }
}
   