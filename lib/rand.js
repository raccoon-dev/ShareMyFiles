"use strict";

const crypto = require("crypto");

module.exports = (prefix, length) => {
    const dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    for (let i = 0; i < length; i++) {
        result += dict.charAt(Math.floor(crypto.randomInt(0, dict.length)));
    };
    return result;
}