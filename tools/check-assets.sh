#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Проверка целостности ресурсов сайта VOLTA RENT.
#
# Зачем: страницы ссылаются на папку assets/ (стили, скрипт, фото, видео).
# Если её переименовать, переместить или потерять файл — сайт останется без
# оформления, а git покажет это как удаление десятков файлов. Этот скрипт
# ловит такое состояние до коммита.
#
# Запуск вручную:   bash tools/check-assets.sh
# Автоматически:    pre-commit хук (устанавливается tools/install-hooks.sh)
# ---------------------------------------------------------------------------
set -u
cd "$(dirname "$0")/.." || exit 1

fail=0
ok()  { printf '  \033[32m✓\033[0m %s\n' "$1"; }
err() { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail + 1)); }

echo "Проверка ресурсов сайта"
echo

# 1. Папка assets
if [ -d assets ]; then
  ok "папка assets/ на месте ($(find assets -type f | wc -l | tr -d ' ') файлов)"
else
  err "нет папки assets/ — все страницы останутся без стилей, картинок и скриптов"
fi

# 2. Обязательные файлы
for f in index.html fleet.html booking.html contacts.html \
         assets/css/style.css assets/js/app.js \
         assets/img/hero.jpg assets/img/credits.json \
         assets/video/road-nature.mp4; do
  [ -f "$f" ] && ok "$f" || err "нет файла $f"
done

# 3. Ссылки внутри страниц, CSS и JS — всё должно существовать на диске
python3 - <<'PY'
import json, pathlib, re, sys

root = pathlib.Path('.')
problems = []

def exists(rel):
    return (root / rel).exists()

pages = ['index.html', 'fleet.html', 'booking.html', 'contacts.html']

for page in pages:
    if not root.joinpath(page).exists():
        problems.append(f'{page}: страница не найдена')
        continue
    text = root.joinpath(page).read_text(encoding='utf-8')
    anchors = set(re.findall(r'id="([^"]+)"', text))

    for attr in ('href', 'src', 'poster'):
        for url in re.findall(attr + r'="([^"]+)"', text):
            if url.startswith(('http', 'mailto:', 'tel:', 'data:', '#')):
                continue
            path, _, frag = url.partition('#')
            if path and not exists(path):
                problems.append(f'{page}: нет файла {url}')
            elif frag and not path and frag not in anchors:
                problems.append(f'{page}: нет якоря #{frag}')

    for icon in set(re.findall(r'#i-([a-z-]+)', text)):
        if f'<symbol id="i-{icon}"' not in text:
            problems.append(f'{page}: нет иконки #{icon} в спрайте')

missing_credits = []
css_path = root / 'assets/css/style.css'
if css_path.exists():
    css = css_path.read_text(encoding='utf-8')
    for url in set(re.findall(r'url\("\.\./([^"]+)"\)', css)):
        if not (root / 'assets' / url).exists():
            problems.append(f'style.css: нет фона assets/{url}')

js_path = root / 'assets/js/app.js'
if js_path.exists():
    js = js_path.read_text(encoding='utf-8')
    for url in set(re.findall(r"'(assets/[^']+)'", js)):
        if not exists(url):
            problems.append(f'app.js: нет ресурса {url}')

credits_path = root / 'assets/img/credits.json'
if credits_path.exists():
    credits = json.loads(credits_path.read_text(encoding='utf-8'))
    missing_credits = [c['file'] for c in credits if not (root / 'assets/img' / c['file']).exists()]
    credit_note = f'{len(credits)} записей credits.json'
else:
    credit_note = 'credits.json не найден'
    missing_credits = ['credits.json']

if problems:
    print('\n'.join('  \033[31m✗\033[0m ' + p for p in problems))
    print(f'  проблем в ссылках: {len(problems)}')
if missing_credits:
    print('\n'.join('  \033[31m✗\033[0m credits.json: нет файла ' + m for m in missing_credits))

if not problems and not missing_credits:
    print(f'  \033[32m✓\033[0m ссылки, якоря, иконки и {credit_note} в порядке')
sys.exit(1 if (problems or missing_credits) else 0)
PY
py_status=$?
[ $py_status -ne 0 ] && fail=$((fail + 1))

echo
if [ "$fail" -eq 0 ]; then
  echo "ИТОГ: всё на месте, можно коммитить"
  exit 0
fi
echo "ИТОГ: найдены проблемы ($fail) — исправьте их до коммита"
exit 1
