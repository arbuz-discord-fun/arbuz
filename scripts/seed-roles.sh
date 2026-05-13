#!/usr/bin/env bash
# Вставляет ID Discord-ролей в таблицу server_roles.
# Использование: ./scripts/seed-roles.sh <arbuz_role_id> <tykvenets_role_id>

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$SCRIPT_DIR/.env"
  set +a
fi

ARBUZ_ID="${1:?Укажи ID роли арбуза: ./scripts/seed-roles.sh <arbuz_id> <tykvenets_id>}"
TYKVENETS_ID="${2:?Укажи ID роли тыквенца: ./scripts/seed-roles.sh <arbuz_id> <tykvenets_id>}"

docker compose exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "
INSERT INTO server_roles (role_type, role_id) VALUES
  ('arbuz',     '$ARBUZ_ID'),
  ('tykvenets', '$TYKVENETS_ID')
ON CONFLICT (role_type) DO UPDATE SET role_id = EXCLUDED.role_id;
"

echo "Готово. Текущие роли:"
docker compose exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM server_roles;"
