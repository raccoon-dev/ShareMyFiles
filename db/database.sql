PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

CREATE TABLE files (
    id        INTEGER      PRIMARY KEY,
    name      TEXT         NOT NULL,
    mime      TEXT,
    sha       TEXT,
    link      TEXT         NOT NULL,
    upl_link  TEXT,
    size      BIGINT       NOT NULL
                           CHECK (size >= 0),
    dt_create VARCHAR (19) NOT NULL
                           DEFAULT (datetime('now') ),
    valid_h   INTEGER      NOT NULL
                           DEFAULT (0),
    valid_dwn INTEGER,
    dwn_ctr   INTEGER      DEFAULT (0) 
);


CREATE TABLE users (
    id        INTEGER      PRIMARY KEY,
    role      TEXT         NOT NULL,
    link      TEXT,
    comment   TEXT         DEFAULT NULL,
    dt_create VARCHAR (19) NOT NULL
                           DEFAULT (datetime('now') ),
    u_create  TEXT,
    valid_h   INTEGER      DEFAULT (0) 
);


CREATE VIEW v_files_invalid AS
    SELECT f.*,
           datetime(f.dt_create, 'localtime') AS dt_create_l,
           datetime(f.dt_create, 'localtime', '+' || f.valid_h || ' hours') AS dt_valid,
           f.valid_dwn - f.dwn_ctr AS dwn_avail
      FROM files f
     WHERE datetime('now') >= datetime(f.dt_create, '+' || f.valid_h || ' hours') OR 
           ( (f.valid_dwn IS NULL) OR 
             ( (f.valid_dwn IS NOT NULL) AND 
               (f.dwn_ctr >= f.valid_dwn) ) );


CREATE VIEW v_files_valid AS
    SELECT f.*,
           datetime(f.dt_create, 'localtime') AS dt_create_l,
           datetime(f.dt_create, 'localtime', '+' || f.valid_h || ' hours') AS dt_valid,
           f.valid_dwn - f.dwn_ctr AS dwn_avail,
           IIF(u.link IS NULL, 'N', 'Y') AS upl_exists
      FROM files f
           LEFT JOIN
           users u ON (u.link = f.upl_link AND 
                       datetime('now') < datetime(u.dt_create, '+' || u.valid_h || ' hours') ) 
     WHERE datetime('now') < datetime(f.dt_create, '+' || f.valid_h || ' hours') AND 
           ( (f.valid_dwn IS NULL) OR 
             ( (f.valid_dwn IS NOT NULL) AND 
               (f.dwn_ctr < f.valid_dwn) ) );


CREATE VIEW v_users_invalid AS
    SELECT u.*,
           datetime(u.dt_create, 'localtime') AS dt_create_l,
           datetime(u.dt_create, 'localtime', '+' || u.valid_h || ' hours') AS dt_valid
      FROM users u
     WHERE datetime('now') >= datetime(u.dt_create, '+' || u.valid_h || ' hours');


CREATE VIEW v_users_valid AS
    SELECT u.*,
           datetime(u.dt_create, 'localtime') AS dt_create_l,
           datetime(u.dt_create, 'localtime', '+' || u.valid_h || ' hours') AS dt_valid
      FROM users u
     WHERE datetime('now') < datetime(u.dt_create, '+' || u.valid_h || ' hours');


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
