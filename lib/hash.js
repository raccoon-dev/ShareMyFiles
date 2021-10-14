"use strict";

const fs     = require('fs');
const crypto = require('crypto');
const rand   = require('./rand');

module.exports = async function(filePath, secret) {
    return await new Promise((resolve, reject) => {
        let hash = crypto.createHmac("sha1", secret),
          stream = fs.createReadStream(filePath);
    
        stream.on('data', (data) => {
            hash.update(data, 'utf8');
        });
      
        stream.on('end', () => {
            resolve(hash.digest('hex') + '_' + rand('', 6));
        });
    });
}