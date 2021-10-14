"use strict";

const sqlite3 = require('sqlite3').verbose();
const log     = require('../lib/log');

module.exports = class {

    #db_path = '';

    constructor(db_path) {
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

    async select_uploaders(link) {
        let q;
        if (link === undefined) {
            q = "SELECT ROW_NUMBER() OVER (ORDER BY dt_create DESC) AS row_num, * FROM v_users_valid WHERE role='Uploader'";
        } else {
            q = "SELECT ROW_NUMBER() OVER (ORDER BY dt_create DESC) AS row_num, * FROM v_users_valid WHERE link='" + link + "' AND role='Uploader'";
        }
        return await this.query(q);
    }

    async insert_user(role, link, valid, comment) {
        const q = `INSERT INTO users (role, link, comment, valid_h) VALUES ('${role}', '${link}', '${comment}', '${valid}')`
        return await this.execute(q);
    }

    async delete_user(link) {
        const q = `DELETE FROM users WHERE link="${link}"`;
        return await this.execute(q);
    }

    async select_invalids() {
        let q = "SELECT * FROM v_users_invalid WHERE role='Uploader'";
        return await this.query(q);
   }

}