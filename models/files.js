"use strict";

const sqlite3 = require('sqlite3');
const log     = require('../lib/log');

module.exports = class {

    #db_path = '';

    constructor(db_path, files_path) {
        this.#db_path = db_path;
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.#db_path);
            db.all(sql, (err, rows) => {
                if (err) {
                    log.error(err);
                    reject(err);
                } else {
                    //console.log(rows);
                    resolve(rows);
                }
            });
        });
    }

    execute(sql) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.#db_path);
            db.all(sql, (err, rows) => {
                if (err) {
                    log.error(err);
                    reject(err);
                } else {
                    //console.log(rows);
                    resolve(true);
                }
            });
        });
    }

    async select_files_for_uploader(uploader_link) {
        let q;
        if (uploader_link === '') {
            q = "SELECT ROW_NUMBER() OVER (ORDER BY dt_valid) AS row_num, * FROM v_files_valid";
        } else {
            q = "SELECT ROW_NUMBER() OVER (ORDER BY dt_valid) AS row_num, * FROM v_files_valid WHERE upl_link='" + uploader_link + "'";
        }
        return await this.query(q);
    }

    async select_files(file_link) {
        let q;
        if (file_link === '') {
            q = "SELECT ROW_NUMBER() OVER (ORDER BY dt_valid) AS row_num, * FROM v_files_valid";
        } else {
            q = "SELECT ROW_NUMBER() OVER (ORDER BY dt_valid) AS row_num, * FROM v_files_valid WHERE link='" + file_link + "'";
        }
        return await this.query(q);
    }

    async delete_file(link) {
        const q = `DELETE FROM files WHERE link="${link}"`;
        return await this.execute(q);
    }

    async inc_downloads(link) {
        const q = `UPDATE files SET dwn_ctr = dwn_ctr + 1 WHERE link="${link}"`;
        return await this.execute(q);
    }

    async insert_file(name, mime, link, sha, uploaderId, size, valid_h, valid_dwn) {
        const q = `INSERT INTO files (name, mime, sha, link, upl_link, size, valid_h, valid_dwn) VALUES ("${name}", "${mime}", "${sha}", "${link}", "${uploaderId}", "${size}", "${valid_h}", "${valid_dwn}")`;
        return await this.execute(q);
    }

    async select_invalids() {
        let q = "SELECT * FROM v_files_invalid";
        return await this.query(q);
   }

}