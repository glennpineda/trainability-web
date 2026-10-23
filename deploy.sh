#!/usr/bin/env bash
# Upload the website to the FTP server.
# Usage: ./deploy.sh [--check]
# Credentials come from .env (if present) or the environment — see .env.example.
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

: "${FTP_HOST:?FTP_HOST is not set}"
: "${FTP_USER:?FTP_USER is not set}"
: "${FTP_PASS:?FTP_PASS is not set}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
FTP_PROTOCOL="${FTP_PROTOCOL:-ftps}"

# Files that make up the live site
FILES=(index.html styles.css main.js $(find assets -type f))

case "$FTP_PROTOCOL" in
  ftps) scheme=ftp;  tls=(--ssl-reqd) ;;
  ftp)  scheme=ftp;  tls=() ;;
  sftp) scheme=sftp; tls=() ;;
  *) echo "Unknown FTP_PROTOCOL: $FTP_PROTOCOL" >&2; exit 1 ;;
esac

base="${scheme}://${FTP_HOST}${FTP_PORT:+:$FTP_PORT}/${FTP_REMOTE_DIR#/}"
base="${base%/}"

# --check: log in and list the remote folder without uploading anything
if [[ "${1:-}" == "--check" ]]; then
  echo "Connecting to $FTP_HOST ($FTP_PROTOCOL), listing ${FTP_REMOTE_DIR}"
  printf 'user = "%s:%s"\n' "$FTP_USER" "$FTP_PASS" | \
    curl --silent --show-error --fail "${tls[@]}" --config - --list-only "$base/"
  echo "Connection OK"
  exit 0
fi

# Pass credentials via a config on stdin so they never appear in the process list
for f in "${FILES[@]}"; do
  echo "Uploading $f"
  printf 'user = "%s:%s"\n' "$FTP_USER" "$FTP_PASS" | \
    curl --silent --show-error --fail --ftp-create-dirs "${tls[@]}" \
      --config - --upload-file "$f" "$base/$f"
done

echo "Deployed ${#FILES[@]} files to $FTP_HOST$FTP_REMOTE_DIR"
