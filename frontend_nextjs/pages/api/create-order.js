import path from "path";
import fs from "fs";
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  const body = req.body;
  // Call server-side demo order file if exists
  // For demo, return mock order
  const mock = {
    orderId: `order_${Date.now()}`,
    amount: body.tokenAmount * 1000 * 100,
    currency: "INR",
    keyId: "rzp_test_DEMO",
    propertyId: body.propertyId,
    tokenAmount: body.tokenAmount,
    mock: true
  };
  return res.status(200).json(mock);
}