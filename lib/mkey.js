"use strict";

const fs   = require('fs');
const path = require('path');

const MIN_LINK_LENGTH = 12;

function _is_link(link_type, link) {
    return (
        (
            (typeof link === 'string') ||
            (link instanceof String)
        ) &&
        (link.length >= MIN_LINK_LENGTH) &&
        (link.charAt(0) === link_type)
    );
}

function is_upload_link(link) {
    return _is_link('u', link);
}

function is_download_link(link) {
    return _is_link('d', link);
}

function is_file_link(link) {
    return _is_link('f', link);
}

function is_master_link(link) {
    if (_is_link('a', link)) {
        try {
            let result = false;
            let json = JSON.parse(
                fs.readFileSync(
                    path.resolve(
                        __dirname,
                        '../db/master_keys.json'
                    ),
                    'utf8'
                )
            );
            json.forEach(mkey => {
                if (mkey.key === link) {
                    result = true;
                }
            });
            return result;
        } catch (error) {
            return false;
        }
    } else {
        return false;
    }
};

module.exports = {
    is_master_link,
    is_upload_link,
    is_download_link,
    is_file_link
};
