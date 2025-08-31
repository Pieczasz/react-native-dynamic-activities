#!/bin/bash
set -euo pipefail

if which clang-format >/dev/null; then
  # Format ObjC/CPP files in ios/
  find ios -type f \( -name "*.h" -o -name "*.hpp" -o -name "*.cpp" -o -name "*.m" -o -name "*.mm" \) -print0 | while IFS= read -r -d '' file; do
    clang-format -style=file:./config/.clang-format -i "$file"
  done
else
  echo "[ERROR]: clang-format is not installed - Install with 'brew install clang-format' (or manually from https://clang.llvm.org/docs/ClangFormat.html)"
fi