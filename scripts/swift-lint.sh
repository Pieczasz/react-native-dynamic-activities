#!/bin/bash
set -euo pipefail

if which swiftlint >/dev/null; then
  (cd ios && swiftlint --quiet --fix >/dev/null 2>&1 || true)
  (cd ios && swiftlint --quiet >/dev/null 2>&1 || true)
else
  echo "[ERROR]: SwiftLint is not installed - Install with 'brew install swiftlint' (or manually from https://github.com/realm/SwiftLint)"
fi