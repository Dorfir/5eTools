# search_urls.js

Simple Node.js CLI to find URLs in local Markdown (.md) files.

Usage:

```powershell
node search_urls.js <file-or-directory> [--json] [-r|--recursive] [-o|--out <file>]
```

- Pass a single `.md` file or a directory; by default the directory is scanned non-recursively.
- `-r` or `--recursive` will walk directories recursively.
- `--json` prints results as JSON.
- `-o <file>` or `--out <file>` writes output to the specified file (JSON or plain text depending on `--json`).

Example:

```powershell
node search_urls.js curse_of_strahd.md
node search_urls.js . -r -o urls.txt
node search_urls.js . --json -r -o urls.json
```
