import { useState } from "react";
export default function KYCStatus(){
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState(null);

  async function check(){
    const res = await fetch(`/api/kyc-status?userId=${encodeURIComponent(userId)}`);
    const j = await res.json();
    setStatus(j);
  }

  return (
    <div style={{padding:20}}>
      <h3>KYC Status</h3>
      <input placeholder="User ID" value={userId} onChange={e=>setUserId(e.target.value)} />
      <button onClick={check}>Check</button>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}