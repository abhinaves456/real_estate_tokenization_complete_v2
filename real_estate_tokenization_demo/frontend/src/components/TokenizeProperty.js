import React, {useState} from 'react';

export default function TokenizeProperty(){
  const [metadataURI, setMetadataURI] = useState('');
  async function mint(){
    alert('Run truffle script to mint: ' + metadataURI);
  }
  return (
    <div>
      <h2>Tokenize Property (Demo)</h2>
      <input placeholder="metadataURI (ipfs://...)" value={metadataURI} onChange={e=>setMetadataURI(e.target.value)} />
      <button onClick={mint}>Mint Deed NFT (Run truffle)</button>
    </div>
  );
}
