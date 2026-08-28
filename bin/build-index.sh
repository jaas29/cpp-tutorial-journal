#!/usr/bin/env bash
# Regenerate the link lists in index.html and journal/index.html.
#
# Each list lives between a pair of marker comments in the HTML:
#     <!-- BEGIN:lessons -->  ...generated...  <!-- END:lessons -->
# Everything outside the markers is hand-written and is never touched.
#
# Titles come from each file's <title> tag, the one-line blurb from its
# <meta name="description">. Markdown learning records use their first "# " heading.
#
# Only the shared directories are ever scanned. Nothing under private/ can reach an index.
#
# Run after adding a lesson, reference sheet, learning record, or journal entry.
# It is idempotent: running it twice in a row leaves no diff.

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)
REPO_BLOB="https://github.com/jaas29/cpp-tutorial-journal/blob/main"

# Pull the text out of <title>...</title>, minus the tags.
html_title() {
  sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p' "$1" | head -1
}

# Pull the content="..." out of <meta name="description">. Empty if absent.
html_desc() {
  sed -n 's/.*<meta name="description" content="\([^"]*\)".*/\1/p' "$1" | head -1
}

# One <li> per HTML file in a directory, ordered by filename.
list_html_dir() {
  local dir=$1 prefix=$2 f title desc
  for f in "$ROOT/$dir"/*.html; do
    [ -e "$f" ] || continue
    title=$(html_title "$f")
    desc=$(html_desc "$f")
    printf '  <li><a href="%s%s">%s</a>' "$prefix" "$(basename "$f")" "$title"
    [ -n "$desc" ] && printf '\n    <span class="note">%s</span>' "$desc"
    printf '</li>\n'
  done
}

# One <li> per Markdown learning record, linked to the GitHub blob view, which
# renders Markdown. GitHub Pages would serve these as a plain-text download.
list_records() {
  local f title
  for f in "$ROOT"/learning-records/*.md; do
    [ -e "$f" ] || continue
    # First "# " heading, with Markdown `backticks` turned into <code> spans.
    title=$(sed -n 's/^# //p' "$f" | head -1 | sed 's/`\([^`]*\)`/<code>\1<\/code>/g')
    printf '  <li><a href="%s/learning-records/%s">%s</a></li>\n' \
      "$REPO_BLOB" "$(basename "$f")" "$title"
  done
}

# Journal entries, newest first. Filenames are YYYY-MM-DD.html, so a reverse
# filename sort is a reverse date sort.
list_journal() {
  local f title desc
  while IFS= read -r f; do
    [ -e "$f" ] || continue
    [ "$(basename "$f")" = "index.html" ] && continue
    title=$(html_title "$f")
    desc=$(html_desc "$f")
    printf '  <li><a href="./%s">%s</a>' "$(basename "$f")" "$title"
    [ -n "$desc" ] && printf '\n    <span class="note">%s</span>' "$desc"
    printf '</li>\n'
  done < <(find "$ROOT/journal" -maxdepth 1 -name '*.html' | sort -r)
}

# Splice generated text between <!-- BEGIN:name --> and <!-- END:name --> in a file.
# Reads the replacement from stdin.
splice() {
  local file=$1 name=$2 body tmp
  body=$(mktemp)
  tmp=$(mktemp)
  cat > "$body"
  awk -v name="$name" -v bodyfile="$body" '
    index($0, "<!-- BEGIN:" name " -->") {
      print
      while ((getline line < bodyfile) > 0) print line
      close(bodyfile)
      skip = 1
      next
    }
    index($0, "<!-- END:" name " -->") { skip = 0 }
    !skip { print }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
  rm -f "$body"
}

list_html_dir lessons   "./lessons/"   | splice index.html lessons
list_html_dir reference "./reference/" | splice index.html reference
list_records                           | splice index.html records
list_journal                           | splice journal/index.html entries

echo "Rebuilt index.html and journal/index.html"
