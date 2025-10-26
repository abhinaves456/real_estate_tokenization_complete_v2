import { useState } from "react";
import { ethers } from "ethers";

export default function MintWidget({propertyId, tokenPrice=1000, contractAddress, contractAbi}){
  const [status, setStatus] = useState("");
  const [tokens, setTokens] = useState(1);

  async function buyTokens(){
    try{
      if(!window.ethereum) return alert("Install MetaMask");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setStatus("Creating Razorpay order (frontend demo)...");
      // Here you'd call your backend to create an order; we'll simulate by calling payment API
      const resp = await fetch('/api/create-order', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({propertyId, tokenAmount: tokens})
      });
      const data = await resp.json();
      if(data.mock){
        setStatus("Mock payment succeeded — calling mint");
      } else {
        setStatus("Payment created — redirecting to Razorpay checkout (not implemented in demo).");
        // In production, integrate Razorpay checkout here.
      }

      // Call mint on-chain (requires backend signature or contract method)
      if(contractAddress && contractAbi){
        setStatus("Minting tokens on-chain...");
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        // Assumes contract has mintTokens(address recipient, uint256 amount) - replace with actual method
        const tx = await contract.mintTokens(await signer.getAddress(), tokens);
        await tx.wait();
        setStatus("Mint successful: " + tx.hash);
      } else {
        setStatus("Mint skipped (no contract configured in demo).");
      }
    }catch(e){
      setStatus("Error: "+e.message);
    }
  }

  return (
    <div style={{border:"1px dashed #bbb",padding:12,borderRadius:8,marginTop:12}}>
      <h4>Buy Tokens</h4>
      <p>Price per token: ₹{tokenPrice}</p>
      <label>Tokens: <input type="number" value={tokens} min={1} onChange={e=>setTokens(e.target.value)} /></label>
      <div style={{marginTop:8}}>
        <button onClick={buyTokens}>Buy</button>
      </div>
      <div style={{marginTop:8}}><small>{status}</small></div>
    </div>
  );
}