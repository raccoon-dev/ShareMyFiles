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

function render_404(next, err) {
    let httperr = new Error(err);
    httperr.status = 404;
    httperr.stack = '';
    next(httperr);
}

module.exports = (req, resp, next) => {
    if (mkey.is_file_link(req.params.fileId)) {
        m_files.select_files(req.params.fileId)
        .then((upl) => {
            if (upl.length > 0) {
                m_files.inc_downloads(req.params.fileId)
                .then(() => {
                    let fpath = path.resolve(req.app.g_folderUpload, upl[0].sha.substr(0, 2), upl[0].sha + '.upload');
                    resp.writeHead(200, {
                        'Content-Type': upl[0].mime,
                        'Content-Disposition' : 'attachment; filename=' + upl[0].name,
                        'Cache-Control': 'no-store, no-cache',
                        'Content-Length': upl[0].size
                    });
                    fs.createReadStream(fpath).pipe(resp);
                })
                .catch((err) => {
                    log.error(err);
                    render_404(next, '404 - Not found');
                });
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
 