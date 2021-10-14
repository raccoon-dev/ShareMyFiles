"use strict";

const fs = require('fs-extra');

module.exports = async function(file_path_src, file_path_dst) {
    return new Promise((resolve, reject) => {
        fs.move(file_path_src, file_path_dst, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        })
    });
}
