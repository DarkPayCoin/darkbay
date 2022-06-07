let crypto = require('crypto');

 export const getNewKeys = () => {
    const newKeys = crypto.createECDH('secp256r1');
    newKeys.generateKeys();
  return newKeys;
  }

  export const getB64PubKey = (string: any) => {
    const res = string.getPublicKey().toString('base64');
  return res;
  }

  export const getB64PrivKey = (string: any) => {
    const res = string.getPrivateKey().toString('base64');
  return res;
  }

  export const getSecret = (string: any) => {
    const res = string.getPrivateKey().toString('base64');
  return res;
  }
  

//   var encrypt64 = function(aMsg, aSecret) {
//     var cipher, tRet;
//     cipher = crypto.createCipher('aes-256-cbc', aSecret);
//     tRet = cipher.update(aMsg, 'utf8', 'base64');
//     tRet += cipher.final('base64');
//     return tRet;
//   };
  
//   var decrypt64 = function(aMsg, aSecret) {
//     var decipher, tRet;
//     decipher = crypto.createDecipher('aes-256-cbc', aSecret);
//     tRet = decipher.update(aMsg.replace(/\s/g, "+"), 'base64', 'utf8');
//     tRet += decipher.final('utf8');
//     return tRet;
//   };