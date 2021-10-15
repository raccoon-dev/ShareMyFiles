# ShareMyFiles

## Description

Node.js application to share files with friends and family. There is no sign up or sign in in this application. Everyone can use it if only know correct link.

Application is created with node.js, express, bootstrap and use sqlite database.

Application operates on links. There are 3 types of links in application:
 * Administration - can create uploader users
 * Uploader - can upload files to server
 * Download - can download file

Use administration URI to create uploader links. You can share that links with your friends and next they can use that links to upload files. When uploader user upload some file, download link is generated. One link per file. You or your friends can use that links to download files.

Every links except administration have live time from 1 hour to 1 year. Links are automatically destroyed after this time.
Every files can be downloaded limited number of times. Uploader user can set up max download value during uploading.

## Installation

  1. Install [node.js](https://nodejs.org/)
  2. Clone repository
  3. npm update
  4. Copy file "env" to ".env" and edit it.
  5. Copy file "db/database.clean.db" to "db/database.db" or create that database from "db/database.sql" file.
  6. Copy file "db/master_keys.json.example" to "db/master_keys.json". Edit "key" value from file. This value must start with lowercase letter "a" and contain random string.
  7. Run application:
    * npm run dev - for development environment - use nodemon to automatically restart application after changes in source code.
    * npm start - for production environment (node index is also ok).

## Daemonize (Linux)

 1. Edit application paths in files "sharemyfiles.service" and install_service.sh".
 2. Execute file "install_service.sh".

## Configuration

Administration URI consists of three parts http://[SERVER]/[PATH]/[ID].
 * SERVER is your server IP or domain name
 * PATH is readed from .env file from PATH_ADMIN constant
 * ID is readed from key value from "db/master_key.json" file
eg: http://127.0.0.1/administration/a1234567890

Uncomment NODE_ENV=production from .env file to set up production environment. This will disable console logs.

## Troubleshooting

### Nginx reverse proxy configuration

```
    location / {
        proxy_pass http://localhost:3033;
        proxy_pass_header Accept;
        proxy_pass_header Server;
        keepalive_requests 1000;
        proxy_redirect off;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Ssl on;
        proxy_set_header    X-Real-IP       $remote_addr;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_connect_timeout       600;
        proxy_send_timeout          600;
        proxy_read_timeout          600;
        send_timeout                600;
        client_max_body_size        0;
        proxy_buffering             off;
        proxy_request_buffering     off;
    }
```

## ToDo

 * Send link to email
 * Add more logs
 * Fix reload page after upload
 * Change upload to websockets
