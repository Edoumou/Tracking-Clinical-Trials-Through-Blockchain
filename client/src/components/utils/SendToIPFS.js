const ipfsConnection = require('./ipfsConnection');

/**
 * 
 * @param {Object} encryptedData 
 * @returns data cid
 */
async function SendToIPFS(encryptedData) {
    let ipfs = ipfsConnection.default;
    
    let cid;
    await ipfs.add(encryptedData)
        .then(res => {
            cid = res;
        })
        .catch(err => console.error(err));

    return cid;
}

export default SendToIPFS;