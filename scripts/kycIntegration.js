// scripts/kycIntegration.js
// KYC Integration for Indian Users (Aadhaar + PAN)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Mock KYC provider API (In production, use Signzy, IDfy, or Digilocker)
const KYC_API_KEY = process.env.KYC_API_KEY || 'demo_api_key';
const KYC_API_SECRET = process.env.KYC_API_SECRET || 'demo_api_secret';

/**
 * Validate Aadhaar number format
 */
function validateAadhaarFormat(aadhaarNumber) {
  if (!aadhaarNumber || typeof aadhaarNumber !== 'string') {
    return { valid: false, error: 'Aadhaar required' };
  }
  // Remove spaces and hyphens
  const cleaned = aadhaarNumber.replace(/[\s-]/g, '');
  // Check if 12 digits
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: "Aadhaar must be 12 digits" };
  }
  // Verhoeff algorithm check could be added here; omitted for demo
  return { valid: true, cleaned };
}

/**
 * Validate PAN format
 */
function validatePANFormat(panNumber) {
  if (!panNumber || typeof panNumber !== 'string') {
    return { valid: false, error: 'PAN required' };
  }
  const cleaned = panNumber.toUpperCase().replace(/\s/g, '');
  // PAN format: ABCDE1234F
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned)) {
    return { valid: false, error: "Invalid PAN format (should be ABCDE1234F)" };
  }
  return { valid: true, cleaned };
}

/**
 * Send OTP to Aadhaar-linked mobile (mock)
 */
async function sendAadhaarOTP(aadhaarNumber) {
  try {
    const validation = validateAadhaarFormat(aadhaarNumber);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Mock OTP generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const txnId = `TXN${Date.now()}`;

    // Save OTP temporarily (demo only). In production use a secure store with TTL.
    saveOTPDetails(txnId, {
      aadhaar: validation.cleaned,
      otp: otp, // DO NOT persist raw OTP in production
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
      attempts: 0
    });

    console.log(`✅ [DEMO] OTP sent (txnId=${txnId}) OTP=${otp}`);
    return { success: true, txnId, demo_otp: otp, message: 'OTP sent to registered mobile' };
  } catch (err) {
    console.error('❌ Error sending Aadhaar OTP:', err.message);
    throw err;
  }
}

/**
 * Verify OTP and return mocked eKYC data
 */
async function verifyAadhaarOTP(txnId, otp) {
  try {
    const otpDetails = getOTPDetails(txnId);
    if (!otpDetails) throw new Error('Invalid or expired transaction ID');

    if (new Date() > new Date(otpDetails.expires_at)) throw new Error('OTP expired. Please request a new one');
    if (otpDetails.attempts >= 3) throw new Error('Maximum OTP attempts exceeded');
    if (otp !== otpDetails.otp) {
      otpDetails.attempts += 1;
      saveOTPDetails(txnId, otpDetails);
      throw new Error(`Invalid OTP. ${3 - otpDetails.attempts} attempts remaining`);
    }

    const ekyc = await fetchAadhaarEKYCData(otpDetails.aadhaar);
    deleteOTPDetails(txnId);
    return { success: true, verified: true, ekyc_data: ekyc };
  } catch (err) {
    console.error('❌ Verify Aadhaar OTP failed:', err.message);
    throw err;
  }
}

/**
 * Mock fetch Aadhaar eKYC data
 */
async function fetchAadhaarEKYCData(aadhaarNumber) {
  const masked = aadhaarNumber.replace(/\d(?=\d{4})/g, 'X');
  console.log(`📥 Fetching eKYC for Aadhaar: ${masked}`);
  // Mocked eKYC payload
  const mockData = {
    name: "Raj Kumar Sharma",
    dob: "1990-05-15",
    gender: "M",
    address: {
      house: "123",
      street: "MG Road",
      locality: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      country: "India"
    },
    photo: "base64_photo_data_here",
    email: "raj.kumar@example.com",
    mobile: "+919876543210",
    aadhaar_last_4: aadhaarNumber.slice(-4),
    verified_at: new Date().toISOString()
  };
  return mockData;
}

/**
 * Verify PAN (mock)
 */
async function verifyPAN(panNumber, nameFromAadhaar) {
  const validation = validatePANFormat(panNumber);
  if (!validation.valid) throw new Error(validation.error);

  const panData = {
    pan: validation.cleaned,
    name: nameFromAadhaar,
    status: "Active",
    aadhaar_linked: true,
    category: "Individual",
    verified_at: new Date().toISOString()
  };

  const nameMatch = panData.name.toLowerCase().includes(nameFromAadhaar.toLowerCase().split(' ')[0]);
  return { success: true, verified: true, pan_data: panData, name_match: nameMatch };
}

/**
 * Verify bank account (mock penny-drop)
 */
async function verifyBankAccount(accountNumber, ifscCode, accountHolderName) {
  const bankData = {
    account_number: accountNumber,
    ifsc_code: ifscCode,
    account_holder_name: accountHolderName,
    bank_name: "State Bank of India",
    branch: "Bandra West Branch",
    account_type: "Savings",
    status: "Active",
    upi_id: `${accountHolderName.replace(/\s/g, '').toLowerCase()}@sbi`,
    verified_at: new Date().toISOString()
  };
  const nameMatch = true;
  return { success: true, verified: true, bank_data: bankData, name_match: nameMatch };
}

/**
 * Perform AML screening (mock)
 */
async function performAMLScreening(personalDetails) {
  const screeningResult = {
    name: personalDetails.name,
    dob: personalDetails.dob,
    screening_date: new Date().toISOString(),
    sanctions_match: false,
    pep_match: false,
    adverse_media_match: false,
    risk_score: 15,
    risk_level: "Low",
    cleared: true
  };
  return { success: true, cleared: screeningResult.cleared, screening_data: screeningResult };
}

/**
 * Full KYC flow (demo)
 */
async function completeKYCVerification(userInput) {
  try {
    console.log('🎯 Starting KYC for', userInput.userId || '(generated)');
    const kycData = {
      user_id: userInput.userId || `USER_${Date.now()}`,
      wallet_address: userInput.walletAddress,
      started_at: new Date().toISOString(),
      status: 'in_progress'
    };

    // Aadhaar
    const otpResp = await sendAadhaarOTP(userInput.aadhaarNumber);
    const otp = otpResp.demo_otp;
    const aadhaarResult = await verifyAadhaarOTP(otpResp.txnId, otp);
    kycData.aadhaar_verified = true;
    kycData.ekyc_data = aadhaarResult.ekyc_data;

    // PAN
    const panResult = await verifyPAN(userInput.panNumber, aadhaarResult.ekyc_data.name);
    kycData.pan_verified = true;
    kycData.pan_data = panResult.pan_data;

    // Bank
    const bankResult = await verifyBankAccount(userInput.accountNumber, userInput.ifscCode, aadhaarResult.ekyc_data.name);
    kycData.bank_verified = true;
    kycData.bank_data = bankResult.bank_data;

    // AML
    const amlResult = await performAMLScreening({ name: aadhaarResult.ekyc_data.name, dob: aadhaarResult.ekyc_data.dob });
    kycData.aml_cleared = amlResult.cleared;
    kycData.aml_data = amlResult.screening_data;

    // Finalize
    kycData.status = 'completed';
    kycData.completed_at = new Date().toISOString();
    kycData.kyc_level = 'FULL';
    saveKYCData(kycData.user_id, kycData);

    console.log('✅ KYC complete for', kycData.user_id);
    return { success: true, kyc_complete: true, user_id: kycData.user_id, kyc_level: kycData.kyc_level, verified_name: kycData.ekyc_data.name, can_invest: true };
  } catch (err) {
    console.error('❌ KYC failed:', err.message);
    throw err;
  }
}

/**
 * Check KYC status helper
 */
function checkKYCStatus(userId) {
  const kycData = getKYCData(userId);
  if (!kycData) return { kyc_complete: false, status: 'not_started', message: 'Please complete KYC verification' };
  return { kyc_complete: kycData.status === 'completed', status: kycData.status, kyc_level: kycData.kyc_level, verified_name: kycData.ekyc_data?.name, completed_at: kycData.completed_at };
}

/**
 * Storage helpers (file-based demo store)
 */
function saveOTPDetails(txnId, data) {
  const dir = path.join(__dirname, '../kyc_data/otp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${txnId}.json`), JSON.stringify(data, null, 2));
}
function getOTPDetails(txnId) {
  const filePath = path.join(__dirname, '../kyc_data/otp', `${txnId}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return null;
}
function deleteOTPDetails(txnId) {
  const filePath = path.join(__dirname, '../kyc_data/otp', `${txnId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
function saveKYCData(userId, data) {
  const dir = path.join(__dirname, '../kyc_data/users');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${userId}.json`), JSON.stringify(data, null, 2));
}
function getKYCData(userId) {
  const filePath = path.join(__dirname, '../kyc_data/users', `${userId}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return null;
}

/**
 * Demo runner
 */
async function demoKYCFlow() {
  const sampleUser = {
    userId: 'USER_DEMO_001',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    aadhaarNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    accountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    email: 'investor@example.com',
    phone: '+919876543210'
  };
  return completeKYCVerification(sampleUser);
}

// Exports
module.exports = {
  sendAadhaarOTP,
  verifyAadhaarOTP,
  verifyPAN,
  verifyBankAccount,
  performAMLScreening,
  completeKYCVerification,
  checkKYCStatus,
  demoKYCFlow
};

// Run demo if file executed directly
if (require.main === module) {
  demoKYCFlow()
    .then(() => {
      console.log('\n✨ KYC integration demo complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal:', err.message);
      process.exit(1);
    });
}
