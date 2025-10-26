// migrations/3_deploy_rental_distribution.js
const RentalIncomeDistribution = artifacts.require("RentalIncomeDistribution");
const MockERC20 = artifacts.require("MockERC20");

module.exports = async function(deployer, network, accounts) {
  console.log('\n========================================');
  console.log('🏠 Deploying Rental Distribution (using mocks)');
  console.log('========================================\n');

  try {
    const mocks = JSON.parse(require('fs').readFileSync('./deployment_mocks.json'));
    const fractionalAddr = mocks.fractional;
    const stableAddr = mocks.stablecoin;

    if (!fractionalAddr || !stableAddr) {
      throw new Error('Mock token addresses not found. Ensure migration 2 ran successfully.');
    }

    await deployer.deploy(RentalIncomeDistribution, fractionalAddr, stableAddr);
    const rental = await RentalIncomeDistribution.deployed();
    console.log(`✅ RentalIncomeDistribution deployed at: ${rental.address}`);

    // Save deployment info
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../deployment_rental.json');
    const info = {
      network,
      rental_distribution: rental.address,
      fractional_token: fractionalAddr,
      stablecoin: stableAddr,
      deployed_at: new Date().toISOString(),
      deployer: accounts[0]
    };
    fs.writeFileSync(outputPath, JSON.stringify(info, null, 2));
    console.log(`📁 Deployment info saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
};