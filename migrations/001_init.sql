CREATE TABLE IF NOT EXISTS rolls (
  date       DATE        NOT NULL,
  user_id    TEXT        NOT NULL,
  value      INTEGER     NOT NULL,
  mode       TEXT        NOT NULL CHECK (mode IN ('normal', 'anarchy')),
  finalized  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (date, user_id)
);

CREATE TABLE IF NOT EXISTS tiebreaks (
  date       DATE        NOT NULL,
  round      INTEGER     NOT NULL,
  user_id    TEXT        NOT NULL,
  value      INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (date, round, user_id)
);

-- key-value хранилище для состояния тай-брейка и прочей мета-информации
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Discord-роли сервера, настраиваемые через !setrole
CREATE TABLE IF NOT EXISTS server_roles (
  role_type TEXT PRIMARY KEY CHECK (role_type IN ('arbuz', 'tykvenets')),
  role_id   TEXT NOT NULL
);
