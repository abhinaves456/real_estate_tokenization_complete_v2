// Simple Express backend: attestation + IPFS demo (no real keys)
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// POST /attest -> accepts { propertyId, metadataURI, registrarSignature (optional) }
app.post('/attest', (req, res) => {
  const { propertyId, metadataURI } = req.body;
  if(!propertyId || !metadataURI) return res.status(400).send({ error: 'missing' });
  const attestation = {
    propertyId,
    metadataURI,
    attestedAt: new Date().toISOString(),
    attestor: "Registrar-Demo"
  };
  return res.json({ success: true, attestation });
});

app.listen(3001, () => console.log('Backend demo running on http://localhost:3001'));
