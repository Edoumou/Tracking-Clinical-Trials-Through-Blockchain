import DecryptData from './DecryptData';
const ipfsConnection = require('./ipfsConnection');

/**
 * 
 * @param {string} cid 
 * @returns data cid
 */
async function FetchFromIPFS(cid, ENCRYPTION_KEY) {
    let ipfs = ipfsConnection.default;

    let encryptedData = await ipfs.cat(cid);
    let decryptedData = DecryptData(encryptedData, ENCRYPTION_KEY);

    return decryptedData;

}

export default FetchFromIPFS;