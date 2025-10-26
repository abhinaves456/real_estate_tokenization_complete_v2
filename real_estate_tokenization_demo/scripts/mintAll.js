// Simple truffle script to mint all metadataURI entries from metadata/metadataURIs.json
const DeedNFT = artifacts.require("DeedNFT");
const fs = require('fs');

module.exports = async function(callback) {
  try {
    const deed = await DeedNFT.deployed();
    const data = JSON.parse(fs.readFileSync('metadata/metadataURIs.json'));
    const accounts = await web3.eth.getAccounts();
    for (let i = 0; i < data.length; i++) {
      const uri = data[i];
      const tx = await deed.mintDeed(accounts[0], uri, { from: accounts[0] });
      console.log("Minted:", uri, "tx:", tx.tx);
    }
    callback();
  } catch (e) {
    console.error(e);
    callback(e);
  }
}
