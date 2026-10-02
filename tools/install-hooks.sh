#!/usr/bin/env bash
# Устанавливает git-хуки проекта (hooks не хранятся в репозитории, поэтому их
# нужно ставить после клонирования).
#
#   bash tools/install-hooks.sh
#
# Ставит pre-commit, который запускает tools/check-assets.sh и не даёт
# закоммитить состояние без папки assets или с битыми ссылками.
set -e
cd "$(dirname "$0")/.."

if [ ! -d .git ]; then
  echo "Это не git-репозиторий — сначала git init"
  exit 1
fi

mkdir -p .git/hooks
cat > .git/hooks/pre-commit <<'HOOK'
#!/usr/bin/env bash
# Автоматически создан tools/install-hooks.sh
bash tools/check-assets.sh || {
  echo
  echo "Коммит отменён: проверка ресурсов не пройдена."
  echo "Если нужно закоммитить намеренно: git commit --no-verify"
  exit 1
}
HOOK
chmod +x .git/hooks/pre-commit tools/check-assets.sh

echo "Готово: pre-commit установлен."
echo "Проверка запускается при каждом коммите, вручную — bash tools/check-assets.sh"
