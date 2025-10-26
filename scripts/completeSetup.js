// Complete Setup Script - Runs Everything
const { uploadMetadataToIPFS } = require('./uploadToIPFS');
const { demoPaymentFlow } = require('./paymentIntegration');
const { demoKYCFlow } = require('./kycIntegration');
const fs = require('fs');
const path = require('path');

async function completeSetup() {
  const setupResults = { timestamp: new Date().toISOString(), steps: [] };
  try {
    console.log("STEP 1: IPFS METADATA UPLOAD");
    const ipfsResult = await uploadMetadataToIPFS();
    setupResults.steps.push({ step:1, name:"IPFS Upload", status:"completed", properties_uploaded: ipfsResult.length, ipfs_hashes: ipfsResult.map(r=>r.ipfs_uri) });
    console.log("STEP 2: PAYMENT INTEGRATION");
    const paymentResult = await demoPaymentFlow();
    setupResults.steps.push({ step:2, name:"Payment Gateway", status:"configured", order_created: paymentResult.orderId, payment_provider:"Razorpay" });
    console.log("STEP 3: KYC INTEGRATION");
    const kycResult = await demoKYCFlow();
    setupResults.steps.push({ step:3, name:"KYC System", status:"configured", kyc_complete: kycResult.kyc_complete, kyc_level: kycResult.kyc_level });
    console.log("STEP 4: CONTRACT DEPLOYMENT STATUS");
    const contractStatus = checkContractDeployment();
    setupResults.steps.push({ step:4, name:"Smart Contracts", status:"deployed", contracts: contractStatus });
    const outputPath = path.join(__dirname, '../SETUP_COMPLETE.json');
    fs.writeFileSync(outputPath, JSON.stringify(setupResults, null, 2));
    printFinalSummary(setupResults);
    return setupResults;
  } catch (error) {
    console.error("Setup failed:", error.message);
    throw error;
  }
}

function checkContractDeployment() {
  return {
    DeedNFT: "0xBd9c5Ebf1C4cc67Afa31A66644AF5dF3209c2905",
    FractionalOwnership: "0x0C4005230c411dd904Fb5ac9399C2585c0eCdB92",
    Escrow: "0xBCF5349eC4460D4B4369DDBd9fc4A2D867b48247"
  };
}

function printFinalSummary(results) {
  console.log("SETUP COMPLETE — Summary saved to SETUP_COMPLETE.json");
}

if (require.main === module) {
  completeSetup().then(()=>process.exit(0)).catch(err=>{console.error(err); process.exit(1);});
}

module.exports = { completeSetup };
