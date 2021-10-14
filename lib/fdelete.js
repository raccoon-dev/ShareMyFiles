"use strict";

const fs = require('fs-extra');

module.exports = (file_path) => {
    fs.unlink(file_path, (err) => {
        if (err) {
            throw err;
        }
    });
}