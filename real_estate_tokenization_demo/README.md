# Real Estate Tokenization - Demo (Indian Context)

This demo contains:
- Smart contracts (DeedNFT, FractionalOwnership, Escrow)
- Indian-context contracts (LegalCompliance, KYCVerification, PaymentGateway)
- Truffle migrations and a mint script
- Backend attestation stub (Express)
- Minimal React frontend demo (Register / Tokenize / Verify)
- Sample metadata files

How to run (local demo):
1. Start Ganache (or Hardhat node) on http://127.0.0.1:8545
2. `npm install` in root, backend and frontend folders as needed
3. `truffle migrate --reset --network development`
4. `node backend/server.js`
5. `npm start` in frontend to run demo UI (optional)
6. `truffle exec scripts/mintAll.js` to mint sample NFTs

This project is for research and demo purposes. Legal modules simulate compliance and are NOT legal enforcement tools.
