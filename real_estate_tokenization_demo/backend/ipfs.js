// IPFS helper (demo) - requires IPFS node or Infura project in real usage
const { create } = require('ipfs-http-client');

function getClient() {
  return create({ url: 'https://ipfs.io' });
}

module.exports = { getClient };
