import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from 'config';
import verify from "../helper-functions";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const bitcoinNetwork = config.get("bitcoin_network");
    const proxyAdmin = config.get("proxy_admin");
    let bitcoinRelayLogic;

    if (bitcoinNetwork == "mainnet") {
        bitcoinRelayLogic = await deployments.get("BitcoinRelayLogic");
    } else {
        bitcoinRelayLogic = await deployments.get("BitcoinRelayLogicTestnet");
    }

    let theArgs = [
        bitcoinRelayLogic.address,
        proxyAdmin,
        "0x"
    ];

    const deployedContract = await deploy("BitcoinRelayProxy", {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
        args: theArgs,
    });

    if (network.name != "hardhat" && process.env.ETHERSCAN_API_KEY && process.env.VERIFY_OPTION == "1") {
        await verify(
            deployedContract.address, 
            theArgs, 
            "contracts/relay/BitcoinRelayProxy.sol:BitcoinRelayProxy"
        )
    }
};

export default func;
func.tags = ["BitcoinRelayProxy"];
