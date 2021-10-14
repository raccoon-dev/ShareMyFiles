"use strict";

const KEY_LENGTH = 16;

const path        = require('path');
const DB_PATH     = path.resolve(__dirname, '../db/database.db');
const rand        = require('../lib/rand');
//const dot         = require('dotenv/config');
const mkey        = require('../lib/mkey');
const model_users = require('../models/users.js');
const model_files = require('../models/files.js');
const m_users     = new model_users(DB_PATH);
const m_files     = new model_files(DB_PATH);
const log         = require('../lib/log');

function render_view(resp, params) {
    // Retrieve lists from model
    const wait = Promise.all([
        m_users.select_uploaders(),
        m_files.select_files_for_uploader('')
    ]);
    wait.then((result) => {
        params.uploaders   = result[0];
        params.files       = result[1];
        //console.log(params.uploaders);
        //console.log(params.files);
        // Render view
        resp.render('admin', params);
    });
}

module.exports = (req, resp, next) => {
    if (mkey.is_master_link(req.params.adminId)) {
        const isPost = (req.method === 'POST'); // True === is form

        // Create parameters for view
        let params = {
            adminId    : req.params.adminId,
            adminIdLink: process.env.PATH_ADMIN + '/' + req.params.adminId,
            frm: {
                address: req.url,
            },
            uploaders  : [],
            files      : []
        };

        // Create new uploader
        if (req.method === 'POST') {
            // Prepare and render POST
            params.frm.link    = rand('u', KEY_LENGTH);
            params.frm.valid   = req.body.selValid;
            params.frm.comment = req.body.edtComment;
            m_users.insert_user(
                'Uploader',
                params.frm.link,
                params.frm.valid,
                params.frm.comment
            ).then(() => {
                params.frm.isOk    = true;
                params.frm.message = 'User ' + params.frm.link + ' has been successfully created.';
                log.info('Uploader ' + params.frm.link + ' created.');
                render_view(resp, params);
            }).catch((err) => {
                log.error(err);
                params.frm.isOk    = false;
                params.frm.message = 'Error during save upload link in database.'
                render_view(resp, params);
            });
            return;
        };
        // Render GET
        render_view(resp, params);
        return;
    };
    let err = new Error('404 - Not found');
    err.status = 404;
    err.stack = '';
    next(err);
}