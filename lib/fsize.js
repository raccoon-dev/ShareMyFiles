"use strict";

const fs = require('fs');

module.exports = async function(file_path) {
    return new Promise((resolve, reject) => {
        fs.stat(file_path, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats.size);
            }
        });
    });
}
