#!/bin/bash
set -euo pipefail

if which swiftformat >/dev/null; then
  swiftformat ios --config ./config/.swiftformat --quiet
else
  echo "[ERROR]: SwiftFormat is not installed - Install with 'brew install swiftformat' (or manually from https://github.com/nicklockwood/SwiftFormat)"
fi