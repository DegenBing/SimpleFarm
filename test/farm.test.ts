import hre, { deployments } from "hardhat";
import { Rewards, MockERC20, RewardToken } from "../typechain";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { getTime, toTime, addTime } from "../scripts/common";

export const setup = async () => {
  await deployments.fixture(["local"]);

  const { deployer } = await hre.ethers.getNamedSigners();
  const [alice] = await hre.ethers.getUnnamedSigners();

  const rewardToken = await hre.ethers.getContract("RewardToken", deployer) as RewardToken;
  const testUSDC = await hre.ethers.getContract("MockUSDC", deployer) as MockERC20;

  const eth_pool = await hre.ethers.getContract("pool_eth", deployer) as Rewards;
  const usdc_pool = await hre.ethers.getContract("pool_usdc", deployer) as Rewards;
  
  rewardToken.setMinter(deployer.address, parseEther("10000"));
  rewardToken.mint(deployer.address, parseEther("10000"));

  return { alice, deployer, rewardToken, testUSDC, eth_pool , usdc_pool};
}

(process.env.FORKING_TEST ? xdescribe : describe)("farm", function () {

  it("eth pool", async function () {
    const { alice, deployer, rewardToken, eth_pool } = await setup();
    var provider = hre.ethers.provider;
    await rewardToken.transfer(eth_pool.address, parseEther("100"));
    // 1 day with 100 token
    await eth_pool.setRewardParams(parseEther("100"), 86400);

    expect(await provider.getBalance(alice.address)).to.eq(parseEther("10000"));

    await eth_pool.stakeFor(alice.address, parseEther("100"), {value:parseEther("100")});
    expect(await eth_pool.balanceOf(deployer.address)).to.eq(0);
    expect(await eth_pool.balanceOf(alice.address)).to.eq(parseEther("100"));
    await eth_pool.connect(alice).exit();

    expect(await provider.getBalance(alice.address)).to.closeTo(parseEther("10100"), 10**15);
    
  });

  it("usdc pool", async function () {
    const { alice, deployer, rewardToken, testUSDC, usdc_pool } = await setup();
    var provider = hre.ethers.provider;
    await rewardToken.transfer(usdc_pool.address, parseEther("10000"));
    // 1 day with 1 token
    await usdc_pool.setRewardParams(parseEther("1"), 86400);

    await testUSDC.mint(deployer.address, parseEther("100"));
    await testUSDC.approve(usdc_pool.address, parseEther("100"));
    await usdc_pool.stake(parseEther("100"));
    var curTime = await getTime();
    expect(await usdc_pool.balanceOf(deployer.address)).to.eq(parseEther("100"));
    expect(await rewardToken.balanceOf(deployer.address)).to.eq(0);
    await toTime(curTime + 864);
    await usdc_pool.getReward();
    expect(await rewardToken.balanceOf(deployer.address)).to.closeTo(parseEther("0.01"), 10**6);

    await addTime(86400);
    await usdc_pool.exit();
    expect(await rewardToken.balanceOf(deployer.address)).to.closeTo(parseEther("1"), 10**14);
  
  });

});

