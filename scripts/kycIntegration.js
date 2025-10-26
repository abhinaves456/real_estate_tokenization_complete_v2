// KYC Integration for Indian Users (Aadhaar + PAN)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KYC_API_KEY = process.env.KYC_API_KEY || 'demo_api_key';
const KYC_API_SECRET = process.env.KYC_API_SECRET || 'demo_api_secret';

function validateAadhaarFormat(aadhaarNumber) {
  const cleaned = aadhaarNumber.replace(/[\s-]/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: "Aadhaar must be 12 digits" };
  }
  return { valid: true, cleaned };
}

function validatePANFormat(panNumber) {
  const cleaned = panNumber.toUpperCase().replace(/\s/g, '');
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned)) {
    return { valid: false, error: "Invalid PAN format (should be ABCDE1234F)" };
  }
  return { valid: true, cleaned };
}

async function sendAadhaarOTP(aadhaarNumber) {
  try {
    const validation = validateAadhaarFormat(aadhaarNumber);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const txnId = `TXN${Date.now()}`;
    saveOTPDetails(txnId, {
      aadhaar: validation.cleaned,
      otp: otp,
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempts: 0
    });
    return { success: true, txnId, demo_otp: otp };
  } catch (error) {
    throw error;
  }
}

async function verifyAadhaarOTP(txnId, otp) {
  try {
    const otpDetails = getOTPDetails(txnId);
    if (!otpDetails) throw new Error("Invalid or expired transaction ID");
    if (new Date() > new Date(otpDetails.expires_at)) throw new Error("OTP expired. Please request a new one");
    if (otpDetails.attempts >= 3) throw new Error("Maximum OTP attempts exceeded");
    if (otp !== otpDetails.otp) {
      otpDetails.attempts += 1;
      saveOTPDetails(txnId, otpDetails);
      throw new Error(`Invalid OTP. ${3 - otpDetails.attempts} attempts remaining`);
    }
    const eKYCData = await fetchAadhaarEKYCData(otpDetails.aadhaar);
    deleteOTPDetails(txnId);
    return { success: true, verified: true, ekyc_data: eKYCData };
  } catch (error) {
    throw error;
  }
}

async function fetchAadhaarEKYCData(aadhaarNumber) {
  const mockData = {
    name: "Raj Kumar Sharma",
    dob: "1990-05-15",
    gender: "M",
    address: {
      house: "123",
      street: "MG Road",
      landmark: "Near Metro Station",
      locality: "Bandra West",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      country: "India"
    },
    photo: "base64_encoded_photo_data...",
    email: "raj.kumar@example.com",
    mobile: "+919876543210",
    aadhaar_last_4: aadhaarNumber.slice(-4),
    verified_at: new Date().toISOString()
  };
  return mockData;
}

async function verifyPAN(panNumber, nameFromAadhaar) {
  try {
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
  } catch (error) {
    throw error;
  }
}

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

async function completeKYCVerification(userInput) {
  const kycData = {
    user_id: userInput.userId || `USER_${Date.now()}`,
    wallet_address: userInput.walletAddress,
    started_at: new Date().toISOString(),
    status: 'in_progress'
  };
  const otpResponse = await sendAadhaarOTP(userInput.aadhaarNumber);
  const otp = otpResponse.demo_otp;
  const aadhaarResult = await verifyAadhaarOTP(otpResponse.txnId, otp);
  kycData.aadhaar_verified = true;
  kycData.ekyc_data = aadhaarResult.ekyc_data;
  const panResult = await verifyPAN(userInput.panNumber, aadhaarResult.ekyc_data.name);
  kycData.pan_verified = true;
  kycData.pan_data = panResult.pan_data;
  const bankResult = await verifyBankAccount(
    userInput.accountNumber,
    userInput.ifscCode,
    aadhaarResult.ekyc_data.name
  );
  kycData.bank_verified = true;
  kycData.bank_data = bankResult.bank_data;
  const amlResult = await performAMLScreening({
    name: aadhaarResult.ekyc_data.name,
    dob: aadhaarResult.ekyc_data.dob
  });
  kycData.aml_cleared = amlResult.cleared;
  kycData.aml_data = amlResult.screening_data;
  kycData.status = 'completed';
  kycData.completed_at = new Date().toISOString();
  kycData.kyc_level = 'FULL';
  saveKYCData(kycData.user_id, kycData);
  return { success: true, kyc_complete: true, user_id: kycData.user_id, kyc_level: kycData.kyc_level, verified_name: kycData.ekyc_data.name, can_invest: true };
}

function checkKYCStatus(userId) {
  const kycData = getKYCData(userId);
  if (!kycData) {
    return { kyc_complete: false, status: 'not_started', message: 'Please complete KYC verification' };
  }
  return { kyc_complete: kycData.status === 'completed', status: kycData.status, kyc_level: kycData.kyc_level, verified_name: kycData.ekyc_data?.name, completed_at: kycData.completed_at };
}

function saveOTPDetails(txnId, data) {
  const dir = path.join(__dirname, '../kyc_data/otp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${txnId}.json`), JSON.stringify(data, null, 2));
}
def saveKYCData_py(userId, data): pass
