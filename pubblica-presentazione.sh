#!/usr/bin/env bash
# Rigenera la presentazione (pagina autonoma + PDF) e la pubblica online.
# Uso:  ./pubblica-presentazione.sh
set -euo pipefail

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$BASE/docs/presentazione-sito.html"
OUT_DIR="$BASE/sito-presentazione"
PDF="$BASE/docs/CRAL-ARES-presentazione-sito.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROGETTO="cral-ares"

echo "→ Genero la pagina autonoma"
/usr/bin/python3 - "$SRC" "$OUT_DIR/index.html" <<'PY'
import sys
src_path, out_path = sys.argv[1], sys.argv[2]
src = open(src_path, encoding="utf-8").read()
i = src.index('<header class="hero">')
head, body = src[:i].strip(), src[i:].strip()
open(out_path, "w", encoding="utf-8").write(f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Come sarà fatto il sito del CRAL ARES: le pagine, la pubblicazione delle offerte, le richieste dei soci e la loro approvazione.">
<meta name="robots" content="noindex, nofollow">
<meta property="og:title" content="Il sito del CRAL ARES">
<meta property="og:description" content="Documento di presentazione del progetto del sito dell'associazione.">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8C%8B%3C/text%3E%3C/svg%3E">
{head}
</head>
<body>
{body}
</body>
</html>
""")
print("   pagina scritta:", out_path)
PY

if [ -x "$CHROME" ]; then
  echo "→ Genero il PDF"
  TMP="$(mktemp -d)"
  cp "$OUT_DIR/index.html" "$TMP/print.html"
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
            --print-to-pdf="$PDF" --virtual-time-budget=8000 \
            "file://$TMP/print.html" >/dev/null 2>&1
  rm -rf "$TMP"
  echo "   PDF aggiornato: $PDF"
else
  echo "   Chrome non trovato: salto la generazione del PDF"
fi

echo "→ Pubblico online (al primo avvio si apre il browser per l'accesso)"
npx -y wrangler@latest pages deploy "$OUT_DIR" --project-name="$PROGETTO" --branch=main
