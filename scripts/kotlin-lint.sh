#!/bin/bash
set -euo pipefail

if which ktlint >/dev/null; then
  # Lint Kotlin in this package's android folder
  (cd android && ktlint --color --relative -F ./**/*.kt || true)
else
  echo "[ERROR]: KTLint is not installed - Install with 'brew install ktlint' (or manually from https://github.com/pinterest/ktlint)"
fi
