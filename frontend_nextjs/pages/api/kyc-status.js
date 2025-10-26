import fs from "fs";
import path from "path";
export default function handler(req,res){
  const userId = req.query.userId || "USER_DEMO_001";
  const file = path.join(process.cwd(), "../metadata/indian_properties.json");
  // demo response
  res.status(200).json({ kyc_complete: true, user_id: userId, kyc_level: "FULL", verified_name: "Raj Kumar Sharma" });
}