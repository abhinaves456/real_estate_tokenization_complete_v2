// Deploy core contracts
const DeedNFT = artifacts.require("DeedNFT");
const FractionalOwnership = artifacts.require("FractionalOwnership");
const Escrow = artifacts.require("Escrow");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(DeedNFT);
  const deed = await DeedNFT.deployed();

  const tokenName = "FractionalToken";
  const tokenSymbol = "FTK";
  const initialOwner = accounts[0];
  await deployer.deploy(FractionalOwnership, tokenName, tokenSymbol, initialOwner);
  const fractional = await FractionalOwnership.deployed();

  const arbiterAddress = accounts[0];
  await deployer.deploy(Escrow, arbiterAddress);
  const escrow = await Escrow.deployed();

  console.log("Deployed:", deed.address, fractional.address, escrow.address);
};
