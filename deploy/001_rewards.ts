import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { parseEther } from "ethers/lib/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployer = await hre.ethers.getNamedSigner('deployer')
  const { deploy } = hre.deployments;

  const Token = await hre.ethers.getContract("RewardToken");

  const pool_eth = await deploy("pool_eth", {
    contract: "Rewards",
    from: deployer.address,
    args: [Token.address, hre.ethers.constants.AddressZero],
    log: true
  });

  if (hre.network.name == "hardhat" || hre.network.name == "bscTest") {
    const USDC = await hre.ethers.getContract("MockUSDC");
    const USDT = await hre.ethers.getContract("MockUSDT");

    await deploy("pool_usdc", {
      contract: "Rewards",
      from: deployer.address,
      args: [Token.address, USDC.address],
      log: true
    });

    await deploy("pool_usdt", {
      contract: "Rewards",
      from: deployer.address,
      args: [Token.address, USDT.address],
      log: true
    });
  }

  return true;
}

func.tags = ['rewards', 'local'];
func.id = "rewards";
export default func;