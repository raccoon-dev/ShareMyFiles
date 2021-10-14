"use strict";

const path        = require('path');
const DB_PATH     = path.resolve(__dirname, '../db/database.db');
const model_files = require('../models/files.js');
const model_users = require('../models/users.js');
const m_files     = new model_files(DB_PATH);
const m_users     = new model_users(DB_PATH);
const fdel        = require('./fdelete');
const log         = require('./log');

module.exports = (folder_upload) => {
    m_users.select_invalids()
    .then((users) => {
        users.forEach(user => {
            // Delete unused users
            m_users.delete_user(user.link);
            log.info(`Uploader ${user.link} terminated.`);
        });
        return m_files.select_invalids();
    })
    .then((files) => {
        files.forEach(file => {
            // Delete unused files
            m_files.delete_file(file.link).then(() => {
                const pth = path.resolve(
                    folder_upload,
                    file.sha.substr(0, 2),
                    file.sha + '.upload'
                );
                fdel(pth);
                log.info(`File ${file.link} terminated.`);
            });
        });
    });
};
