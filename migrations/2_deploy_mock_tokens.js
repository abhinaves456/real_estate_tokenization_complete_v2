// migrations/2_deploy_mock_tokens.js
const MockERC20 = artifacts.require("MockERC20");

module.exports = async function(deployer, network, accounts) {
  console.log('\n========================================');
  console.log('🧪 Deploying Mock Tokens for Demo');
  console.log('========================================\n');

  const initialSupply = web3.utils.toBN(web3.utils.toWei('1000000', 'ether'));

  try {
    // Deploy Mock Fractional Token
    await deployer.deploy(MockERC20, 'MockFractionalToken', 'MFT', initialSupply.toString());
    const fractional = await MockERC20.deployed();
    console.log(`✅ MockFractionalToken deployed at: ${fractional.address}`);

    // Deploy Mock Stablecoin (ERC20)
    await deployer.deploy(MockERC20, 'MockStablecoin', 'MST', initialSupply.toString());
    const stable = await MockERC20.deployed();
    console.log(`✅ MockStablecoin deployed at: ${stable.address}`);

    // Save addresses
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../deployment_mocks.json');
    const info = {
      network,
      fractional: fractional.address,
      stablecoin: stable.address,
      deployed_at: new Date().toISOString(),
      deployer: accounts[0]
    };
    fs.writeFileSync(outputPath, JSON.stringify(info, null, 2));
    console.log(`📁 Mock deployment info saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Mock token deployment failed:', error.message);
    throw error;
  }
};