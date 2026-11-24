#!/bin/sh
# Runs once, when the local database starts for the first time (docker-entrypoint-initdb.d): the
# roles and grants from packages/db/sql/roles, with the passwords from the repo's .env file
# (see .env.example). To run it again, remove the volume: docker compose down --volumes.
set -eu

: "${CREATOROS_MIGRATOR_PASSWORD:?Set CREATOROS_MIGRATOR_PASSWORD in .env (see .env.example)}"
: "${CREATOROS_APP_PASSWORD:?Set CREATOROS_APP_PASSWORD in .env (see .env.example)}"
: "${CREATOROS_AUTH_PASSWORD:?Set CREATOROS_AUTH_PASSWORD in .env (see .env.example)}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v migrator_password="$CREATOROS_MIGRATOR_PASSWORD" \
  -v app_password="$CREATOROS_APP_PASSWORD" \
  -v auth_password="$CREATOROS_AUTH_PASSWORD" \
  -f /creatoros/roles/000_roles.sql \
  -f /creatoros/roles/010_database_grants.sql
