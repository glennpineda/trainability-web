#!/usr/bin/env bash
# Upload the website to the FTP server.
# Usage: ./deploy.sh [--check]
# Credentials come from .env (if present) or the environment — see .env.example.
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/.local/node/bin:$PATH"   # Node, for the build

if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

: "${FTP_HOST:?FTP_HOST is not set}"
: "${FTP_USER:?FTP_USER is not set}"
: "${FTP_PASS:?FTP_PASS is not set}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
FTP_PROTOCOL="${FTP_PROTOCOL:-ftps}"

# Build first: the live site is dist/ (scripts/build.mjs)
if [[ "${1:-}" != "--check" ]]; then
  node scripts/build.mjs
fi
FILES=()
while IFS= read -r f; do FILES+=("${f#dist/}"); done < <(find dist -type f ! -name .DS_Store | sort)

case "$FTP_PROTOCOL" in
  # TLS 1.2: over 1.3 this host (Pure-FTPd) refuses some uploads with 451
  ftps) scheme=ftp;  tls=(--ssl-reqd --tls-max 1.2) ;;
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
# One curl for all the files, so they share one login and connection: opening
# a new FTPS connection per file gets some transfers refused (FTP 451) on this
# host. Anything that still fails gets up to two tries of its own.
upload() {
  printf 'user = "%s:%s"\n' "$FTP_USER" "$FTP_PASS" | \
    curl --silent --show-error --fail --ftp-create-dirs "${tls[@]}" \
      --config - --upload-file "dist/$1" "$base/$1"
}
config=$(mktemp)
trap 'rm -f "$config"' EXIT
{
  printf 'user = "%s:%s"\n' "$FTP_USER" "$FTP_PASS"
  for f in "${FILES[@]}"; do printf 'upload-file = "dist/%s"\nurl = "%s/%s"\n' "$f" "$base" "$f"; done
} > "$config"
echo "Uploading ${#FILES[@]} files"
results=$(curl --silent --ftp-create-dirs "${tls[@]}" --config "$config" --write-out '%{response_code} %{url_effective}\n' || true)

FAILED=()
for f in "${FILES[@]}"; do
  code=$(grep -F " $base/$f" <<<"$results" | tail -1 | cut -d' ' -f1)
  [[ "$code" == "226" ]] || FAILED+=("$f")
done
# The refusals clear after a few seconds, so try again in rounds, waiting longer each time
for wait in 5 15 30; do
  (( ${#FAILED[@]} )) || break
  echo "Retrying ${#FAILED[@]} file(s) in ${wait}s"
  sleep "$wait"
  again=()
  for f in "${FAILED[@]}"; do upload "$f" 2>/dev/null || again+=("$f"); done
  FAILED=("${again[@]+"${again[@]}"}")
done

# Folders the build fully owns: a file there that the build no longer has (a
# team photo Studio dropped) is deleted from the server. Nothing else is ever
# deleted, since public_html also holds other sites.
PRUNE_DIRS=(assets/team)
rdir="/${FTP_REMOTE_DIR#/}"; rdir="${rdir%/}"   # DELE needs the full path: curl sends it before changing folder
for dir in "${PRUNE_DIRS[@]}"; do
  remote=$(printf 'user = "%s:%s"\n' "$FTP_USER" "$FTP_PASS" | \
    curl --silent --show-error "${tls[@]}" --config - --list-only "$base/$dir/" 2>/dev/null || true)
  while IFS= read -r name; do
    name=${name%$'\r'}
    [[ -z "$name" || "$name" == "." || "$name" == ".." ]] && continue
    [[ -f "dist/$dir/$name" ]] && continue
    echo "Removing $dir/$name"
    printf 'user = "%s:%s"\n' "$FTP_USER" "$FTP_PASS" | \
      curl --silent --show-error "${tls[@]}" --config - -o /dev/null -Q "DELE $rdir/$dir/$name" "$base/" || true
  done <<<"$remote"
done

if (( ${#FAILED[@]} )); then
  echo "Deployed $(( ${#FILES[@]} - ${#FAILED[@]} )) of ${#FILES[@]} files to $FTP_HOST$FTP_REMOTE_DIR. These failed:" >&2
  printf '  %s\n' "${FAILED[@]}" >&2
  exit 1
fi
echo "Deployed ${#FILES[@]} files to $FTP_HOST$FTP_REMOTE_DIR"
