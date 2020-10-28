const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3');
const moment = require('moment');
const fs = require('fs');
const args = process.argv;
require('dotenv').config();

// Get network to use from arguments
let network = 'mainnet', mnemonic, provider,controllerAccount, web3;
for (var i = 0; i < args.length; i++) {
  if (args[i] == '--network')
    network = args[i+1];
  if (args[i] == '--provider')
    provider = args[i+1];
  if (args[i] == '--controller')
    controllerAccount = args[i+1];
}
if (!provider) throw('Not provider selected, --provider parameter missing');

mnemonic = process.env.REACT_APP_KEY_MNEMONIC;

console.log('Running deploy on network', network, 'using http provider', provider)
const web3Provider = new HDWalletProvider(mnemonic, new Web3.providers.HttpProvider(provider), 0, 10);
web3 = new Web3(web3Provider)

ZWeb3.initialize(web3.currentProvider);
Contracts.setLocalBuildDir('contracts/build/');

const DATContract = Contracts.getFromLocal('DecentralizedAutonomousTrust');
const AdminUpgradeabilityProxy = Contracts.getFromLocal('AdminUpgradeabilityProxy');
const ProxyAdmin = Contracts.getFromLocal('ProxyAdmin');
const TokenVesting = Contracts.getFromLocal('TokenVesting');
const contracts = {};

const momentNow = moment.utc((new Date()).toUTCString());

// Deploy config taken from
// https://daotalk.org/t/configuration-template-for-fundraising-decentralized-application/1250
// https://alchemy.daostack.io/dao/0x519b70055af55a007110b4ff99b0ea33071c720a/proposal/0xeb9cf2b3d76664dc1e983137f33b2400ad11966b1d79399d7ca55c25ad6283fa

const pricePerETHUSD = 200;
const initGoalUSD = 50000;
const initGoalETH = initGoalUSD/pricePerETHUSD;
const buySlopePointUSD = 300000;
const buySlopePointDXD = 12000;
const buySlopePointETH = buySlopePointUSD/pricePerETHUSD;

// Calculates buy slope from an specific point
const buySlope = parseFloat((2*buySlopePointETH) / (buySlopePointDXD*buySlopePointDXD)).toFixed(18);

// Calculates the buy slope denominator from the slope
const buySlopeDen = parseFloat(1 / buySlope).toFixed()

// Calculates init goal DXD from the initial goal ETH and the slope
const initGoalDXD = Math.sqrt((2*initGoalETH)/buySlope);

async function main() {
  
  const deployer = (await web3.eth.getAccounts())[0];
  
  const deployOptions = {
    collateralType: 'ETH',
    name: 'DXdao',
    symbol: 'DXD',
    currency: '0x0000000000000000000000000000000000000000', // Using ETH
    whitelist: '0x0000000000000000000000000000000000000000', // No Whitelist
    initReserve: '100000000000000000000000', // 100.000 DXD
    initGoal: web3.utils.toWei(initGoalDXD.toString()),
    buySlopeNum: '1',
    buySlopeDen: web3.utils.toWei(buySlopeDen.toString()),
    investmentReserveBasisPoints: '1000', // 10 %
    revenueCommitmentBasisPoints: '1000', // 10 %
    minInvestment: '1000000000000000',  // 0.001 ETH
    feeBasisPoints: '0', // No fee for operations
    autoBurn: true, // Burn when org sell and pay
    openUntilAtLeast: momentNow.add(5, 'years').unix(), // Open for 5 years
    control: controllerAccount,
    beneficiary: controllerAccount,
    feeCollector: controllerAccount,
    vestingCliff: '0',
    vestingDuration: Math.trunc(moment.duration(3, 'years').as('seconds'))
  };

  console.log(`Using account: ${deployer}`, ' \n');
  console.log(`Deploy DAT with config: ${JSON.stringify(deployOptions, null, 2)}`, ' \n');
  
  contracts.proxyAdmin = await ProxyAdmin.new({
    from: deployer
  });
  console.log(`ProxyAdmin deployed ${contracts.proxyAdmin.address}`);

  const OZcontracts = JSON.parse(fs.readFileSync('.openzeppelin/'+network+'.json', 'utf-8')).contracts;

  console.log(`Using DAT implementation `, OZcontracts.DecentralizedAutonomousTrust.address);

  contracts.datProxy = await AdminUpgradeabilityProxy.new(
    OZcontracts.DecentralizedAutonomousTrust.address, // logic
    contracts.proxyAdmin.address, // admin
    [], // data
    {
      from: deployer
    }
  );
  contracts.dat = await DATContract.at(contracts.datProxy.address);
  console.log(`DAT proxy deployed ${contracts.datProxy.address}`);

  // Initialize DAT proxy
  await contracts.dat.methods.initialize(
    deployOptions.initReserve,
    deployOptions.currency,
    deployOptions.initGoal,
    deployOptions.buySlopeNum,
    deployOptions.buySlopeDen,
    deployOptions.investmentReserveBasisPoints,
    deployOptions.name,
    deployOptions.symbol
  ).send({ from: deployer });

  // Deploy token vesting
  contracts.tokenVesting = await TokenVesting.new({
    from: deployer
  });
  await contracts.tokenVesting.methods.initialize(
    deployOptions.control, new moment().unix(), deployOptions.vestingCliff, 
    deployOptions.vestingDuration, false, deployOptions.control
  ).send({ from: deployer });
  console.log(`Token vesting deployed ${contracts.tokenVesting.address}`);

  // Transfer initReserve to tokenVesting
  await contracts.dat.methods.transfer(contracts.tokenVesting.address, deployOptions.initReserve)
    .send({ from: deployer });
  console.log(`Token vesting funded with initReserve ${contracts.tokenVesting.address}`);

  // Update the DAT stting the right values and beneficiary account
  await contracts.dat.methods.updateConfig(
    deployOptions.whitelist,
    deployOptions.beneficiary,
    deployOptions.control,
    deployOptions.feeCollector,
    deployOptions.feeBasisPoints,
    deployOptions.autoBurn,
    deployOptions.revenueCommitmentBasisPoints,
    deployOptions.minInvestment,
    deployOptions.openUntilAtLeast
  ).send({ from: deployer });
  console.log(`DAT config updated`);
  
  // Transfer ownershiop of proxyAdmin to control address
  await contracts.proxyAdmin.methods.transferOwnership(deployOptions.control);  
  
  // Show Token Vetsing values
  console.log('Token vesting contract address:', contracts.tokenVesting.address);
  console.log('Token vesting contract owner:', await contracts.tokenVesting.methods.owner().call());
  console.log('Token vesting contract beneficiary:', await contracts.tokenVesting.methods.beneficiary().call());
  console.log('Token vesting contract balance:', await contracts.dat.methods.balanceOf(contracts.tokenVesting.address).call());
  console.log('Token vesting contract cliff:', await contracts.tokenVesting.methods.cliff().call());
  console.log('Token vesting contract start:', await contracts.tokenVesting.methods.start().call());
  console.log('Token vesting contract duration:', await contracts.tokenVesting.methods.duration().call());
  console.log('Token vesting contract revocable:', await contracts.tokenVesting.methods.revocable().call(), ' \n');

  // Show DAT values
  console.log('DAT contract address:', contracts.dat.address);
  console.log('DAT contract controller:', await contracts.dat.methods.control().call());
  console.log('DAT contract beneficiary:', await contracts.dat.methods.beneficiary().call());
  console.log('DAT contract feeCollector:', await contracts.dat.methods.feeCollector().call());
  console.log('DAT contract whitelist:', await contracts.dat.methods.whitelist().call());
  console.log('DAT contract currency:', await contracts.dat.methods.currency().call());
  console.log('DAT contract totalSupply:', await contracts.dat.methods.totalSupply().call());
  console.log('DAT contract initReserve:', await contracts.dat.methods.initReserve().call());
  console.log('DAT contract initGoal:', await contracts.dat.methods.initGoal().call());
  console.log('DAT contract minInvestment:', await contracts.dat.methods.minInvestment().call());
  console.log('DAT contract revenueCommitmentBasisPoints:', await contracts.dat.methods.revenueCommitmentBasisPoints().call());
  console.log('DAT contract investmentReserveBasisPoints:', await contracts.dat.methods.investmentReserveBasisPoints().call());
  console.log('DAT contract openUntilAtLeast:', await contracts.dat.methods.openUntilAtLeast().call());
  console.log('DAT contract autoBurn:', await contracts.dat.methods.autoBurn().call());
  console.log('DAT contract buySlopeNum:', await contracts.dat.methods.buySlopeNum().call());
  console.log('DAT contract buySlopeDen:', await contracts.dat.methods.buySlopeDen().call());
  console.log('DAT contract feeBasisPoints:', await contracts.dat.methods.feeBasisPoints().call());

  return;
}

Promise.all([main()]).then(process.exit);
