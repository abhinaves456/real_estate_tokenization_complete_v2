import React, {useState} from 'react';

export default function VerifyProperty(){
  const [propertyId, setPropertyId] = useState('');
  async function verify(){
    const res = await fetch('http://localhost:3001/attest', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({propertyId, metadataURI:'ipfs://demo'})});
    const j = await res.json();
    alert('Attestation (demo): ' + JSON.stringify(j.attestation));
  }
  return (
    <div>
      <h2>Verify Property (Demo)</h2>
      <input placeholder="Property ID" value={propertyId} onChange={e=>setPropertyId(e.target.value)} />
      <button onClick={verify}>Verify (Demo)</button>
    </div>
  );
}
