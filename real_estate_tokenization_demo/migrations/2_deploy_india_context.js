// Deploy India context contracts
const LegalCompliance = artifacts.require("LegalCompliance");
const KYCVerification = artifacts.require("KYCVerification");
const PaymentGateway = artifacts.require("PaymentGateway");

module.exports = async function(deployer) {
  await deployer.deploy(LegalCompliance);
  await deployer.deploy(KYCVerification);
  await deployer.deploy(PaymentGateway);
};
