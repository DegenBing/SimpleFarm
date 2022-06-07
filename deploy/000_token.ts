import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { parseEther } from "ethers/lib/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const deployer = await hre.ethers.getNamedSigner('deployer')
    const { deploy } = hre.deployments;

    const Token = await deploy("RewardToken", {
        contract: "Token",
        from: deployer.address,
        log: true
    });

    if (hre.network.name == "hardhat" || hre.network.name == "geori") {
        await deploy("MockUSDC", {
            contract: "MockERC20",
            from: deployer.address,
            args: ["testUSDC", "tUSDC"],
            log: true
        });

        await deploy("MockUSDT", {
            contract: "MockERC20",
            from: deployer.address,
            args: ["testUSDT", "tUSDT"],
            log: true
        });
    }

    return true;
}

func.tags = ['token', 'local'];
func.id = "token";
export default func;