import { BigNumber, ContractTransaction } from "ethers";
import hre from "hardhat";
import { IERC20Metadata__factory } from "../typechain";
import { formatUnits } from "ethers/lib/utils";

export const log = async (t: Promise<ContractTransaction>, i: string) => {
  const tx = await t;
  process.stdout.write(`${i} | tx: ${tx.hash} ...`);
  await tx.wait();
  process.stdout.write(` | Confirmed\n`);
}

export const toBytes32 = (v: BigNumber | string) => {
  return hre.ethers.utils.hexlify(hre.ethers.utils.zeroPad(v instanceof BigNumber ? v.toHexString() : v, 32));
};

export const setStorageAt = async (address: string, index: string, value: string) => {
  await hre.ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
  await hre.ethers.provider.send("evm_mine", []); // Just mines to the next block
};

export const setBalance = async (token: string, holder: string, slot: number, balance: BigNumber, isVy: boolean = false) => {
  const t = IERC20Metadata__factory.connect(token, hre.ethers.provider);

  console.log(`Balance ${t.address} of ${holder} is ${formatUnits(await t.balanceOf(holder), await t.decimals())}`);

  const index = hre.ethers.utils.solidityKeccak256(
    ["uint256", "uint256"],
    isVy ? [slot, holder] : [holder, slot]
  );

  // Solidity => [key, slot]
  // Vyper => [slot, key]

  await setStorageAt(
    token,
    index,
    toBytes32(balance).toString()
  );

  console.log(`Balance ${t.address} of ${holder} is ${formatUnits(await t.balanceOf(holder), await t.decimals())}`);
}

export const forwardTime = async (time: number = 0) => {
  await hre.ethers.provider.send("evm_increaseTime", [time]);
}

export const dumpStorage = async (address: string, from: number = 0, to: number = 0) => {
  for (let i = from; i <= to; i++) {
    console.log(`Address: ${address} Slot: ${i} Value: ${await hre.ethers.provider.getStorageAt(address, i)}`);
  }
}

export const mineBlock = async (blocks: number = 0) => {
  while (blocks > 0) {
    blocks--;
    await hre.ethers.provider.send("evm_mine", []);
  }
}

export const addTime = async (time: number = 0) => {
  await hre.ethers.provider.send("evm_increaseTime", [time]);
  await hre.ethers.provider.send("evm_mine", []);
}

export const getTime = async () => {
  return (await hre.ethers.provider.getBlock("latest")).timestamp;
}

export const toTime = async (time: number = 0) => {
  await hre.ethers.provider.send("evm_setNextBlockTimestamp", [time]);
}