// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenVesting is Ownable {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint total;
        uint claimed;
    }

    mapping(address => UserInfo) public users;

    uint public vestDuration = 365 days;
    uint public vestStart;

    IERC20 public vestToken;

    event ClaimToken(address indexed user, uint amount);

    constructor(IERC20 _token, uint _start) {
        vestToken = _token;

        vestStart = _start;
    }

    function claimToken() external {
        uint amount = claimableAmount(msg.sender);
        require(amount > 0, "claimToken: nothing to claim");

        vestToken.transfer(msg.sender, amount);
        users[msg.sender].claimed += amount;

        emit ClaimToken(msg.sender, amount);
    }

    function claimableAmount(address wallet) public view returns (uint) {
        UserInfo memory info = users[wallet];
        if (block.timestamp >= vestStart + vestDuration) {
            return info.total - info.claimed;
        }
        return info.total * (block.timestamp - vestStart) / vestDuration - info.claimed;
    }

    function setWallet(address[] calldata wallets, uint[] calldata amounts) external onlyOwner {
        require(wallets.length == amounts.length, "setWallet: invalid data");
        for (uint i; i < wallets.length; i++) {
            users[wallets[i]].total = amounts[i];
        }
    }

    function recoverToken(address[] calldata tokens) external onlyOwner {
        for (uint i; i < tokens.length; i++) {
            IERC20(tokens[i]).safeTransfer(msg.sender, IERC20(tokens[i]).balanceOf(address(this)));
        }
    }
}