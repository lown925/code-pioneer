#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "${SCRIPT_DIR}/server/dist/src/main.js" ]]; then
  SERVER_DIR="${SCRIPT_DIR}/server"
elif [[ -f "${SCRIPT_DIR}/code-pioneer/server/dist/src/main.js" ]]; then
  SERVER_DIR="${SCRIPT_DIR}/code-pioneer/server"
else
  echo "Unable to locate server/dist/src/main.js relative to ${SCRIPT_DIR}." >&2
  exit 1
fi

cd "${SERVER_DIR}"
exec node dist/src/main.js
