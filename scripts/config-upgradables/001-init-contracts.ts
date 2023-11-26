import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from "hardhat";
import { BitcoinInterface } from '@teleportdao/bitcoin';
import config from 'config';
const logger = require('node-color-log');

var path = require('path');
var fs = require('fs');
var tempFilePath = path.join(__dirname, '..', '.env');

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ZERO_ADD = "0x0000000000000000000000000000000000000000";

    logger.color('blue').log("-------------------------------------------------")
    logger.color('blue').bold().log("Initialize TeleBTC ...")

    const bitcoinRelayLogic = await deployments.get("BitcoinRelayLogic");
    const bitcoinRelayProxy = await deployments.get("BitcoinRelayProxy");

    const BitcoinRelayLogicFactory = await ethers.getContractFactory(
        "BitcoinRelayLogic"
    );
    const bitcoinRelayLogicInstance = await BitcoinRelayLogicFactory.attach(
        bitcoinRelayLogic.address
    );
    const bitcoinRelayProxyInstance = await BitcoinRelayLogicFactory.attach(
        bitcoinRelayProxy.address
    );

    let _ownerProxy = await bitcoinRelayProxyInstance.owner();
    if (_ownerProxy == ZERO_ADD) {

        let bitcoinNetwork = config.get("bitcoin_network");
        let tdtToken = config.get("tdt_token");

        const networkName = bitcoinNetwork == "mainnet" ? 'bitcoin' : 'bitcoin_testnet';
        const _bitcoinNetwork = {
            name: networkName,
            connection: {
                api: {
                    enabled: true,
                    provider: 'BlockStream',
                    token: null,
                },
            },
        };
        let bitcoinInterface = new BitcoinInterface(
            _bitcoinNetwork.connection,
            _bitcoinNetwork.name
        );

        // Deploys BitcoinRelay
        // note: NEVER START WITH 0! IT MAKES PROBLEM
        let blockCount = await bitcoinInterface.getLatestBlockNumber();
        let height;
        if (blockCount > 5) {
            height = blockCount - 5;
        } else {
            height = blockCount;
        }

        let genesisHeader = await bitcoinInterface.getBlockHeaderHex(height);
        let periodStartHeight = height - height % 2016;
        let periodStart = await bitcoinInterface.getBlockHash(periodStartHeight);
        periodStart = Buffer.from(periodStart , 'hex').reverse().toString('hex');
        
        var blockHeight = "BLOCK_HEIGHT=" + height + "\n";
        fs.appendFileSync(tempFilePath, blockHeight);

        let deployedContract;

        if (bitcoinNetwork == "mainnet") {

            const initializeTxProxy = await bitcoinRelayProxyInstance.initialize(
                '0x' + genesisHeader,
                height,
                '0x' + periodStart,
                tdtToken
            );
            await initializeTxProxy.wait(1);
            console.log("Initialize TeleBTC: ", initializeTxProxy.hash);
        } else {

            const initializeTxProxy = await bitcoinRelayProxyInstance.initialize(
                '0x' + genesisHeader,
                height,
                '0x' + periodStart,
                tdtToken
            );
            await initializeTxProxy.wait(1);
            console.log("Initialize TeleBTC: ", initializeTxProxy.hash);
        }
    }

    let _ownerLogic = await bitcoinRelayLogicInstance.owner();
    if (_ownerLogic == ZERO_ADD) {

        let bitcoinNetwork = config.get("bitcoin_network");
        let tdtToken = config.get("tdt_token");

        const networkName = bitcoinNetwork == "mainnet" ? 'bitcoin' : 'bitcoin_testnet';
        const _bitcoinNetwork = {
            name: networkName,
            connection: {
                api: {
                    enabled: true,
                    provider: 'BlockStream',
                    token: null,
                },
            },
        };
        let bitcoinInterface = new BitcoinInterface(
            _bitcoinNetwork.connection,
            _bitcoinNetwork.name
        );

        // Deploys BitcoinRelay
        // note: NEVER START WITH 0! IT MAKES PROBLEM
        let blockCount = await bitcoinInterface.getLatestBlockNumber();
        let height;
        if (blockCount > 5) {
            height = blockCount - 5;
        } else {
            height = blockCount;
        }

        let genesisHeader = await bitcoinInterface.getBlockHeaderHex(height);
        let periodStartHeight = height - height % 2016;
        let periodStart = await bitcoinInterface.getBlockHash(periodStartHeight);
        periodStart = Buffer.from(periodStart , 'hex').reverse().toString('hex');
        
        var blockHeight = "BLOCK_HEIGHT=" + height + "\n";
        fs.appendFileSync(tempFilePath, blockHeight);

        let deployedContract;

        if (bitcoinNetwork == "mainnet") {

            const initializeTxProxy = await bitcoinRelayLogicInstance.initialize(
                '0x' + genesisHeader,
                height,
                '0x' + periodStart,
                tdtToken
            );
            await initializeTxProxy.wait(1);
            console.log("Initialize TeleBTC: ", initializeTxProxy.hash);
        } else {

            const initializeTxProxy = await bitcoinRelayLogicInstance.initialize(
                '0x' + genesisHeader,
                height,
                '0x' + periodStart,
                tdtToken
            );
            await initializeTxProxy.wait(1);
            console.log("Initialize TeleBTC: ", initializeTxProxy.hash);
        }
    }

};

export default func;