import React, {useState} from 'react';

export default function RegisterProperty(){
  const [propertyId, setPropertyId] = useState('');
  const [rera, setRera] = useState('');
  const [docHash, setDocHash] = useState('');

  async function submit(){
    const res = await fetch('http://localhost:3001/attest', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({propertyId, metadataURI: docHash})
    });
    const j = await res.json();
    alert('Attestation: ' + JSON.stringify(j.attestation));
  }

  return (
    <div>
      <h2>Register Property (Demo)</h2>
      <input placeholder="Property ID" value={propertyId} onChange={e=>setPropertyId(e.target.value)} />
      <input placeholder="RERA ID" value={rera} onChange={e=>setRera(e.target.value)} />
      <input placeholder="IPFS doc hash (metadataURI)" value={docHash} onChange={e=>setDocHash(e.target.value)} />
      <button onClick={submit}>Submit Attestation</button>
    </div>
  );
}
