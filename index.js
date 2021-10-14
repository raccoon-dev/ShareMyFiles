"use strict";

const DELETE_TIMER_INTERVAL = 60; // Time in seconds

require('dotenv').config();
const express      = require('express');
const bodyParser   = require('body-parser');
const delUnused    = require('./lib/delunused');
const routes       = require('./routes');
const busboy       = require('connect-busboy');
const log          = require('./lib/log');

const app = express();

// Set some global variables
let g_port         = process.env.PORT          || 3000;
let g_folderTemp   = process.env.FOLDER_TEMP   || './tmp';
let g_folderUpload = process.env.FOLDER_UPLOAD || './uploads';
let g_pathAdmin    = process.env.PATH_ADMIN    || '/admin';
let g_sha_secret   = process.env.SHA_SECRET    || '1234567890';
app.use((req,res,next) => {
    app.g_port         = g_port;
    app.g_folderTemp   = g_folderTemp;
    app.g_folderUpload = g_folderUpload;
    app.g_pathAdmin    = g_pathAdmin;
    app.g_sha_secret   = g_sha_secret;
    next();
});

app.use(busboy());
app.use(express.static('public')); // Set static files folder
app.set('view engine', 'ejs');     // Set views template engine
app.set('views'      , './views'); // Set views folder
const parser = bodyParser.urlencoded({ extended: false });

//app.get('/', routes.main); // Main path
app.get (g_pathAdmin + '/:adminId' ,         routes.admin);    // Administration path - add new uploaders
app.post(g_pathAdmin + '/:adminId' , parser, routes.admin);    // Administration path - add new uploaders
app.get ('/u/:uploadId'            ,         routes.upload);   // Uploaders path - add new files
app.post('/u/:uploadId'            , parser, routes.upload);   // Uploaders path - add new files
app.get ('/d/:fileId'              ,         routes.download); // Downloaders path - download files
app.post('/d/:fileId'              , parser, routes.download); // Downloaders path - download files
app.get ('/f/:fileId'              ,         routes.download_direct); // Downloaders path - download file directly
app.get ('/del/:ownerId/:elementId',         routes.delete);   // Delete uploader or downloader

app.use(function(req, res, next) {
    let logerr = 'Not found';
    let err    = new Error('404 - ' + logerr);
    err.status = 404;
    err.stack  = '';
    log.error(logerr + ': ' + req.url);
    next(err);
});

// Set timer to delete unused users and files.
setInterval(delUnused, DELETE_TIMER_INTERVAL*1000, g_folderUpload);

const server = app.listen(g_port, ()=> {
    log.info ('ShareMyFiles running on port ' + server.address().port);
    log.debug('Temporary folder set to "' + g_folderTemp + '"');
    log.debug('Upload folder set to "' + g_folderUpload + '"');
    log.debug('Administration path set to "' + g_pathAdmin + '"');
});
