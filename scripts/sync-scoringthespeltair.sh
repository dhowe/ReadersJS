#!/bin/sh
# Refresh the vendored copy of the scoringthespeltair reading-time estimator
# (lib/scoringthespeltair/) from a local clone of the library, and record which
# commit it came from in lib/versions.txt. See README, "Reading time".
#
#   scripts/sync-scoringthespeltair.sh [path-to-library-clone]
#
# The path defaults to $SCORINGTHESPELTAIR, or to the John_adxd26fall copy.
set -e

SRC="${1:-${SCORINGTHESPELTAIR:-/Users/kongqi/Library/CloudStorage/GoogleDrive-john_cayley@brown.edu/My Drive/BrownGDrive2013/Courses/aDxD/aDxD_2026Fall/aDxD 2026 Fall Shared Folder/John_adxd26fall/scoringthespeltair}}"
DEST="$(cd "$(dirname "$0")/.." && pwd)"
FILES="timetoread.js markup.js"

[ -f "$SRC/timetoread.js" ] || { echo "not a scoringthespeltair clone: $SRC" >&2; exit 1; }

if [ -n "$(git -C "$SRC" status --porcelain -- $FILES)" ]; then
  echo "warning: uncommitted changes in $SRC; the recorded commit will not match the copy" >&2
fi

for f in $FILES; do cp "$SRC/$f" "$DEST/lib/scoringthespeltair/$f"; done

COMMIT="$(git -C "$SRC" rev-parse --short HEAD)"
VERSION="$(node -p "require('$SRC/package.json').version" 2>/dev/null || echo '?')"
LINE="scoringthespeltair: v$VERSION commit $COMMIT (timetoread.js, markup.js)"
if grep -q '^scoringthespeltair:' "$DEST/lib/versions.txt"; then
  sed -i.bak "s|^scoringthespeltair:.*|$LINE|" "$DEST/lib/versions.txt" && rm "$DEST/lib/versions.txt.bak"
else
  printf '%s\n' "$LINE" >> "$DEST/lib/versions.txt"
fi
echo "$LINE"
git -C "$DEST" status --short lib scripts
