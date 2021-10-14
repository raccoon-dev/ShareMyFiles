"use strict";

const path        = require('path');
const mkey        = require('../lib/mkey');
const fs          = require('fs-extra');
const mime        = require('mime');
//const fsp         = require('fs').promise;
const DB_PATH     = path.resolve(__dirname, '../db/database.db');
const model_files = require('../models/files.js');
const { render }  = require('ejs');
const m_files     = new model_files(DB_PATH);
const log         = require('../lib/log');

function render_view(resp, params) {
    resp.render('download', params);
}

function render_404(next, err) {
    let httperr = new Error(err);
    httperr.status = 404;
    httperr.stack = '';
    next(httperr);
}

function file_size(size) {
    const KB = 1000;
    const MB = 1000000;
    const GB = 1000000000;
    if (typeof size === "number") {
        if (Math.trunc(size / GB) > 0) {
            return (size / GB).toFixed(2) + ' [GB]';
        } else
        if (Math.trunc(size / MB) > 0) {
            return (size / MB).toFixed(2) + ' [MB]';
        } else
        if (Math.trunc(size / KB) > 0) {
            return (size / KB).toFixed(2) + ' [kB]';
        } else {
            return size + ' [B]';
        }
    }
    return '';
}

module.exports = (req, resp, next) => {
    if (mkey.is_file_link(req.params.fileId)) {
        m_files.select_files(req.params.fileId)
        .then((upl) => {
            if (upl.length > 0) {
                let params = {
                    fileId    : req.params.fileId,
                    fileIdLink: '/d/' + req.params.fileId,
                    fileIdLinkDirect: '/f/' + req.params.fileId,
                    fileName: upl[0].name,
                    fileSize: file_size(upl[0].size),
                    fileValid: upl[0].dt_valid,
                    fileValidDwn: upl[0].valid_dwn,
                    fileValidLeft: upl[0].dwn_avail,
                };
                render_view(resp, params);
            } else {
                render_404(next, '404 - Not found');
            }
        }).catch((err) => {
            log.error(err);
            render_404(next, '404 - Not found');
        });
    } else {
        render_404(next, '404 - Not found');
    }
}
 