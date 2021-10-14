"use strict";

const KEY_LENGTH = 16;

const path        = require('path');
const mkey        = require('../lib/mkey');
const rand        = require('../lib/rand');
const fsize       = require('../lib/fsize');
const fmove       = require('../lib/fmove');
const fdel        = require('../lib/fdelete');
const fs          = require('fs-extra');
const mime        = require('mime');
//const fsp         = require('fs').promise;
const hash        = require('../lib/hash');
const DB_PATH     = path.resolve(__dirname, '../db/database.db');
const model_users = require('../models/users.js');
const model_files = require('../models/files.js');
const { render }  = require('ejs');
const m_users     = new model_users(DB_PATH);
const m_files     = new model_files(DB_PATH);
const log         = require('../lib/log')

function render_view(resp, params) {
    // Retrieve lists from model
    const wait = Promise.all([
        m_files.select_files_for_uploader(params.uploaderId)
    ]);
    wait.then((result) => {
        params.files = result[0];
        //console.log(params.files);
        // Render view
        resp.render('upload', params);
    });
}

function render_404(next, err) {
    let httperr = new Error(err);
    httperr.status = 404;
    httperr.stack = '';
    next(httperr);
}

module.exports = (req, resp, next) => {
    if (mkey.is_upload_link(req.params.uploadId)) {
        m_users.select_uploaders(req.params.uploadId)
        .then((upl) => {
            if (upl.length > 0) {
                let params = {
                    is_upload     : true,
                    uploaderId    : req.params.uploadId,
                    uploaderIdLink: '/u/' + req.params.uploadId,
                    uploaderValid : upl[0].dt_valid,
                    frm: {
                        address   : req.url,
                    },
                    files         : [],
                };
                
                if (req.method === 'POST') {
                    // Upload new file
                    params.frm.link      = rand('f', KEY_LENGTH);
                    params.frm.valid     = req.body.selValid;
                    params.frm.dnw_allow = req.body.edtAllowDnw;

                    let fstream;
                    let temp_filename = rand('', KEY_LENGTH);
                    let temp_path = path.resolve(req.app.g_folderTemp, temp_filename + '.temp');
                    let dest_path;
                    let sha;
                    let size;

                    req.pipe(req.busboy);
                    req.busboy.on('field', (name, value) => {
                        if (name === 'selValid') {
                            params.frm.valid = value;
                        } else
                        if (name === 'edtAllowDnw') {
                            params.frm.dwn_allow = value;
                        };
                    });
                    req.busboy.on('file', (fieldname, file, filename) => {
                        log.info('Upload file "' + filename + '" started.');
                        //Path where image will be uploaded
                        fstream = fs.createWriteStream(temp_path);
                        file.pipe(fstream);
                        fstream.on('close', function () {
                            log.info('Upload file "' + filename + '" finished,');
                            params.frm.isOk    = true;
                            params.frm.message = 'File ' + filename + ' uploaded successfully.';
                            hash( // Calculate hash
                                temp_path,
                                req.app.g_sha_secret
                            ).then((out_sha) => {
                                // Hash calculated. Get file size
                                sha = out_sha;
                                return fsize(temp_path);
                            }).then((out_size) => {
                                // File size retrieved. Move to destination folder.
                                size = out_size;
                                dest_path = path.resolve(req.app.g_folderUpload, sha.substr(0, 2));
                                if (!fs.existsSync(dest_path)){
                                    fs.mkdirSync(dest_path, { recursive: true });
                                };
                                dest_path = path.resolve(dest_path, sha + '.upload');
                                return fmove(temp_path, dest_path);
                            }).then(() => {
                                // File in destination folder. Insert file to db.
                                return m_files.insert_file(
                                    filename,
                                    mime.lookup(path.extname(filename)),
                                    params.frm.link,
                                    sha,
                                    params.uploaderId,
                                    size,
                                    params.frm.valid,
                                    params.frm.dwn_allow
                                );
                            }).then(() => { // Everything ok
                                resp.redirect(req.headers.referer);
                            }).catch((err) => {
                                log.error(err);
                                try {
                                    fdel(temp_path);
                                } catch (error) {
                                }
                                try {
                                    fdel(dest_path);
                                } catch (error) {
                                }
                                params.frm.isOk = false;
                                params.frm.message = 'Error: ' + err;
                                render_view(resp, params);
                            });
                        });
                    });
                } else {
                    render_view(resp, params);
                }
            } else {
                log.error('Trying upload empty file - rejected.');
                render_404(next, '404 - Not found');
            }
        }).catch((err) => {
            log.error(err);
            render_404(next, '404 - Not found');
        });
    } else {
        log.error('Wrong upload link');
        render_404(next, '404 - Not found');
    }
}
 