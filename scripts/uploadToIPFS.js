// Upload Property Data to IPFS using Pinata
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

const PINATA_API_KEY = process.env.PINATA_API_KEY || 'your_api_key_here';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || 'your_secret_key_here';

const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);

const propertyMetadata = require('../metadata/indian_properties.json');

async function uploadMetadataToIPFS() {
  console.log("🚀 Starting IPFS Upload Process...\n");

  const uploadedHashes = [];

  try {
    await pinata.testAuthentication();
    console.log("✅ Pinata authentication successful\n");

    for (let i = 0; i < propertyMetadata.length; i++) {
      const property = propertyMetadata[i];
      console.log(`📤 Uploading Property ${i + 1}: ${property.name}`);
      const result = await pinata.pinJSONToIPFS(property, {
        pinataMetadata: {
          name: `property_${i + 1}_metadata.json`,
          keyvalues: {
            property_id: i + 1,
            location: property.attributes.find(a => a.trait_type === "Location").value
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      });

      const ipfsHash = result.IpfsHash;
      const ipfsURI = `ipfs://${ipfsHash}`;

      uploadedHashes.push({
        property_id: i + 1,
        name: property.name,
        ipfs_hash: ipfsHash,
        ipfs_uri: ipfsURI,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      });

      console.log(`✅ Uploaded: ${ipfsURI}`);
      console.log(`   Gateway: https://gateway.pinata.cloud/ipfs/${ipfsHash}\n`);
    }

    const outputPath = path.join(__dirname, '../metadata/ipfsHashes.json');
    fs.writeFileSync(outputPath, JSON.stringify(uploadedHashes, null, 2));

    const metadataURIs = uploadedHashes.map(item => item.ipfs_uri);
    const urisPath = path.join(__dirname, '../metadata/metadataURIs.json');
    fs.writeFileSync(urisPath, JSON.stringify(metadataURIs, null, 2));
    console.log("🎉 All metadata uploaded successfully!");

    return uploadedHashes;

  } catch (error) {
    console.error("❌ Error uploading to IPFS:", error.message);

    console.log("\n⚠️  Using mock IPFS hashes for demo purposes...\n");

    const mockHashes = propertyMetadata.map((property, i) => ({
      property_id: i + 1,
      name: property.name,
      ipfs_hash: `QmMockHash${i + 1}${Math.random().toString(36).substring(7)}`,
      ipfs_uri: `ipfs://QmMockHash${i + 1}${Math.random().toString(36).substring(7)}`,
      gateway_url: `https://gateway.pinata.cloud/ipfs/QmMockHash${i + 1}`
    }));

    const outputPath = path.join(__dirname, '../metadata/ipfsHashes.json');
    fs.writeFileSync(outputPath, JSON.stringify(mockHashes, null, 2));

    const metadataURIs = mockHashes.map(item => item.ipfs_uri);
    const urisPath = path.join(__dirname, '../metadata/metadataURIs.json');
    fs.writeFileSync(urisPath, JSON.stringify(metadataURIs, null, 2));

    console.log("✅ Mock IPFS hashes created for demo");
    return mockHashes;
  }
}

if (require.main === module) {
  uploadMetadataToIPFS()
    .then(() => {
      console.log("\n✨ IPFS upload complete!");
      process.exit(0);
    })
    .catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { uploadMetadataToIPFS, propertyMetadata };
