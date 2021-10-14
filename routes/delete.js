"use strict";

const path        = require('path');
const fdel        = require('../lib/fdelete');
const DB_PATH     = path.resolve(__dirname, '../db/database.db');
const mkey        = require('../lib/mkey');
const model_users = require('../models/users.js');
const model_files = require('../models/files.js');
const { resolve } = require('path');
const m_users     = new model_users(DB_PATH);
const m_files     = new model_files(DB_PATH);
const log         = require('../lib/log');

function render_404(resp, next) {
    let err = new Error('404 - Not found');
    err.status = 404;
    err.stack = '';
    next(err);
}

function delete_file(req, resp, next, link) {
    let f;
    m_files.select_files(link)
    .then((result) => {
        f = result[0];
        return m_files.delete_file(link);
    }).then((result) => {
        const pth = `${req.app.g_folderUpload}/${f.sha.substr(0, 2)}/${f.sha}.upload`;
        try {
            fdel(pth);
            log.info(`File ${f.link} deleted.`);
            resp.redirect(req.headers.referer);
        } catch (error) {
            log.error(error);
            render_404(resp, next);
        }
    }).catch((err) => {
        log.error(err);
        render_404(resp, next);
    })
}

function delete_user(req, resp, next, link) {
    let u;
    m_users.select_uploaders(link).then((result) => {
        u = result[0];
        return m_users.delete_user(link);
    }).then((result) => {
        log.info(`Uploader ${u.link} deleted.`);
        resp.redirect(req.headers.referer);
    }).catch((err) => {
        log.error(err);
        render_404(resp, next);
    })
}

module.exports = (req, resp, next) => {
    if (mkey.is_master_link(req.params.ownerId)) {
        if (mkey.is_upload_link(req.params.elementId)) {
            // Admin want delete uploader
            //console.debug('Admin want delete uploader');
            delete_user(req, resp, next, req.params.elementId);
        } else
        if (mkey.is_file_link(req.params.elementId)) {
            // Admin want delete file
            //console.debug('Admin want delete file');
            delete_file(req, resp, next, req.params.elementId);
        } else {
            render_404(resp, next);
        }
    } else
    if (mkey.is_upload_link(req.params.ownerId)) {
        if (mkey.is_file_link(req.params.elementId)) {
            // Uploader want delete file
            //console.debug('Uploader want delete file');
            delete_file(req, resp, next, req.params.elementId);
        } else {
            render_404(resp, next);
        }
    } else {
        render_404(resp, next);
    }
}