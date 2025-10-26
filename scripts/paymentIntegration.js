// Razorpay Payment Integration for Property Token Purchase
const Razorpay = require('razorpay');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY_ID';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'SAMPLE_KEY_SECRET';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

const TOKEN_PRICE_INR = 1000;

async function createTokenPurchaseOrder(userDetails, propertyId, tokenAmount) {
  try {
    const amountInPaise = tokenAmount * TOKEN_PRICE_INR * 100;

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `prop_${propertyId}_${Date.now()}`,
      notes: {
        property_id: propertyId,
        token_amount: tokenAmount,
        user_wallet: userDetails.walletAddress,
        user_email: userDetails.email,
        user_phone: userDetails.phone,
        purchase_type: 'property_tokens'
      }
    };

    const order = await razorpay.orders.create(orderOptions);
    saveOrderDetails(order, userDetails, propertyId, tokenAmount);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      propertyId: propertyId,
      tokenAmount: tokenAmount
    };

  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    throw error;
  }
}

function verifyPaymentSignature(orderId, paymentId, signature) {
  try {
    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;
    return isValid;

  } catch (error) {
    console.error("❌ Signature verification error:", error.message);
    return false;
  }
}

async function processSuccessfulPayment(paymentDetails) {
  try {
    const { orderId, paymentId, signature } = paymentDetails;
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      throw new Error("Payment verification failed");
    }

    const order = await razorpay.orders.fetch(orderId);
    const payment = await razorpay.payments.fetch(paymentId);

    const propertyId = order.notes.property_id;
    const tokenAmount = order.notes.token_amount;
    const userWallet = order.notes.user_wallet;

    updateOrderStatus(orderId, 'paid', {
      payment_id: paymentId,
      amount_paid: order.amount / 100,
      payment_method: payment.method,
      paid_at: new Date().toISOString()
    });

    const invoice = generateInvoice({
      orderId,
      paymentId,
      propertyId,
      tokenAmount,
      amountPaid: order.amount / 100,
      userWallet,
      paymentMethod: payment.method,
      timestamp: new Date()
    });

    return {
      success: true,
      orderId,
      paymentId,
      propertyId,
      tokenAmount,
      amountPaid: order.amount / 100,
      invoice: invoice,
      message: "Payment successful and tokens minted"
    };

  } catch (error) {
    console.error("❌ Error processing payment:", error.message);
    throw error;
  }
}

async function handlePaymentFailure(paymentDetails) {
  try {
    const { orderId, errorCode, errorDescription } = paymentDetails;
    updateOrderStatus(orderId, 'failed', {
      error_code: errorCode,
      error_description: errorDescription,
      failed_at: new Date().toISOString()
    });

    return {
      success: false,
      orderId,
      errorCode,
      errorDescription,
      message: "Payment failed"
    };

  } catch (error) {
    console.error("❌ Error handling failure:", error.message);
    throw error;
  }
}

async function getPaymentStatus(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);

    return {
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount / 100,
      status: payment.status,
      method: payment.method,
      created_at: new Date(payment.created_at * 1000).toISOString()
    };

  } catch (error) {
    console.error("❌ Error fetching payment:", error.message);
    throw error;
  }
}

async function refundPayment(paymentId, amount = null, reason = null) {
  try {
    const refundData = { payment_id: paymentId };
    if (amount) refundData.amount = amount * 100;
    if (reason) refundData.notes = { reason };
    const refund = await razorpay.payments.refund(paymentId, refundData);
    return {
      success: true,
      refund_id: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };

  } catch (error) {
    console.error("❌ Error processing refund:", error.message);
    throw error;
  }
}

function saveOrderDetails(order, userDetails, propertyId, tokenAmount) {
  const ordersDir = path.join(__dirname, '../orders');
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }

  const orderData = {
    order_id: order.id,
    amount: order.amount / 100,
    currency: order.currency,
    receipt: order.receipt,
    property_id: propertyId,
    token_amount: tokenAmount,
    user_details: userDetails,
    status: 'created',
    created_at: new Date().toISOString(),
    notes: order.notes
  };

  const filePath = path.join(ordersDir, `${order.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(orderData, null, 2));
}

function updateOrderStatus(orderId, status, additionalData = {}) {
  const filePath = path.join(__dirname, '../orders', `${orderId}.json`);

  if (fs.existsSync(filePath)) {
    const orderData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    orderData.status = status;
    orderData.updated_at = new Date().toISOString();
    Object.assign(orderData, additionalData);
    fs.writeFileSync(filePath, JSON.stringify(orderData, null, 2));
  }
}

function generateInvoice(details) {
  const {
    orderId,
    paymentId,
    propertyId,
    tokenAmount,
    amountPaid,
    userWallet,
    paymentMethod,
    timestamp
  } = details;

  const invoiceNumber = `INV-${Date.now()}`;
  const gstAmount = (amountPaid * 18) / 118;
  const baseAmount = amountPaid - gstAmount;

  const invoice = {
    invoiceNumber,
    invoiceDate: timestamp.toISOString().split('T')[0],
    orderId,
    paymentId,
    propertyId,
    tokenAmount,
    tokenPrice: TOKEN_PRICE_INR,
    baseAmount: baseAmount.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    totalAmount: amountPaid,
    userWallet,
    paymentMethod,
    sellerDetails: {
      name: "PropTech SPV Pvt. Ltd.",
      gstin: "27AAACC1234D1Z5",
      address: "Mumbai, Maharashtra 400001",
      pan: "AAACC1234D"
    }
  };

  const invoicesDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const filePath = path.join(invoicesDir, `${invoiceNumber}.json`);
  fs.writeFileSync(filePath, JSON.stringify(invoice, null, 2));

  return invoice;
}

async function demoPaymentFlow() {
  console.log("🎬 Starting Payment Demo Flow\n");
  const userDetails = {
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    email: "investor@example.com",
    phone: "+919876543210",
    name: "Test Investor"
  };

  try {
    const order = await createTokenPurchaseOrder(userDetails, 1, 10);
    return order;
  } catch (error) {
    if (error.message.includes('key_id') || error.message.includes('key_secret')) {
      const mockOrder = {
        orderId: `order_${Date.now()}`,
        amount: 10 * TOKEN_PRICE_INR * 100,
        currency: 'INR',
        keyId: 'rzp_test_DEMO',
        propertyId: 1,
        tokenAmount: 10,
        status: 'created',
        mock: true
      };
      return mockOrder;
    }
    throw error;
  }
}

module.exports = {
  createTokenPurchaseOrder,
  verifyPaymentSignature,
  processSuccessfulPayment,
  handlePaymentFailure,
  getPaymentStatus,
  refundPayment,
  demoPaymentFlow
};


/**
 * Mint tokens on-chain using ethers (requires provider to be running and ABI/address)
 * This is a demo helper. Replace ABI and method names to match your contract.
 */
const { ethers } = require("ethers");
async function mintOnChain(rpcUrl, contractAddress, contractAbi, recipient, tokenAmount){
  try{
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl || "http://localhost:8545");
    // In production, use server-side signer (do NOT expose private key in frontend)
    const signer = provider.getSigner ? provider.getSigner() : provider; // fallback
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    if(!contract.mintTokens){
      console.warn("Contract does not have mintTokens method. Update function name.");
      return { success:false, message:"mint method missing" };
    }
    const tx = await contract.mintTokens(recipient, tokenAmount);
    await tx.wait();
    return { success:true, txHash: tx.hash };
  }catch(e){
    console.error("Mint on-chain failed:", e.message);
    return { success:false, message: e.message };
  }
}

module.exports.mintOnChain = mintOnChain;
