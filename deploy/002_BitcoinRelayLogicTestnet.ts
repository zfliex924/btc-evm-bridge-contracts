import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from 'config';
import verify from "../helper-functions";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const bitcoinNetwork = config.get("bitcoin_network");

    if (bitcoinNetwork == "testnet") {
        const deployedContract = await deploy("BitcoinRelayLogicTestnet", {
            from: deployer,
            log: true,
            skipIfAlreadyDeployed: true,
        });

        if (network.name != "hardhat" && process.env.ETHERSCAN_API_KEY && process.env.VERIFY_OPTION == "1") {
            await verify(
                deployedContract.address, 
                [], 
                "contracts/relay/BitcoinRelayLogicTestnet.sol:BitcoinRelayLogicTestnet"
            )
        }
    }
};

export default func;
func.tags = ["BitcoinRelayLogic"];
