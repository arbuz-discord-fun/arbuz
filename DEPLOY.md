# Деплой arbuz-bot

Бот запускается через Docker Compose (PostgreSQL + Node.js). Повторные деплои автоматизированы через GitHub Actions — пуш в `main` вызывает пересборку и перезапуск на сервере.

---

## 1. Подготовка сервера

### Зависимости

```bash
# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh

# Git
apt install -y git
```

### Пользователь для деплоя

```bash
# Создать пользователя (если нет)
adduser deploy

# Добавить в группу docker, чтобы мог запускать docker compose без sudo
usermod -aG docker deploy
```

### SSH-ключ для GitHub Actions

```bash
# На локальной машине — генерируем ключевую пару
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/arbuz_deploy

# Публичный ключ добавляем на сервер (от имени пользователя deploy)
ssh-copy-id -i ~/.ssh/arbuz_deploy.pub deploy@<server-ip>
```

Приватный ключ (`arbuz_deploy`) понадобится в шаге 3.

### Клонирование репозитория

```bash
# На сервере, от имени пользователя deploy
mkdir -p /opt/arbuz-bot-new
git clone <repo-url> /opt/arbuz-bot-new
```

### .env файл на сервере

Создать `/opt/arbuz-bot-new/.env` с токенами бота (DB-переменные при деплое придут из GitHub Secrets, но TOKEN и остальное нужно задать вручную один раз):

```env
TOKEN=<токен бота из Discord Developer Portal>
GUILD_ID=<ID сервера Discord>
CHANNEL_ID=<ID канала для объявлений>
```

---

## 2. Настройка Discord-бота

1. Открыть [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. Перейти в **Bot** → **Add Bot**
3. Скопировать **Token** — это значение `TOKEN` в `.env`
4. В разделе **Privileged Gateway Intents** включить:
   - **Server Members Intent** (нужен для управления ролями)
   - **Message Content Intent** (нужен для чтения текста команд)
5. Пригласить бота на сервер через **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Message History`, `Manage Roles`

### Настройка ролей после запуска

**Вариант А — через Discord-команду** (нужно право Управление ролями):

```
!setrole arbuz @НазваниеРоли      — роль победителя дня
!setrole tykvenets @НазваниеРоли  — роль проигравшего
```

**Вариант Б — скриптом**, если ID ролей уже известны (Discord → Settings → Advanced → Developer Mode → ПКМ на роль → Copy ID):

```bash
cd /opt/arbuz-bot-new
DB_USER=<значение> DB_NAME=<значение> \
  ./scripts/seed-roles.sh <arbuz_role_id> <tykvenets_role_id>
```

Скрипт вставляет роли в БД и выводит итоговую таблицу для проверки. Безопасно запускать повторно — перезапишет существующие значения.

---

## 3. Настройка GitHub Secrets

В репозитории: **Settings → Secrets and variables → Actions → New repository secret**

| Секрет | Описание |
|---|---|
| `DEPLOY_HOST` | IP или hostname сервера |
| `DEPLOY_USER` | Пользователь для SSH (например, `deploy`) |
| `DEPLOY_KEY` | Приватный SSH-ключ (содержимое файла `arbuz_deploy`) |
| `DB_USER` | Имя пользователя PostgreSQL |
| `DB_PASSWORD` | Пароль PostgreSQL |
| `DB_NAME` | Имя базы данных PostgreSQL |

---

## 4. Первый запуск

На сервере, от имени пользователя `deploy`:

```bash
cd /opt/arbuz-bot-new

DB_USER=<значение> DB_PASSWORD=<значение> DB_NAME=<значение> \
  docker compose up -d --build

# Проверить что контейнеры запустились
docker compose ps

# Посмотреть логи бота
docker compose logs -f bot
```

Миграции применяются автоматически при первом старте бота.

---

## 5. Повторные деплои

Автоматически — при пуше в ветку `main`:

1. GitHub Actions собирает TypeScript (`tsc`) — если есть ошибки типов, деплой не запускается
2. SSH на сервер: `git reset --hard origin/main`
3. `docker compose up -d --build` — пересобирает образ бота, перезапускает контейнер
4. PostgreSQL-контейнер и данные не трогаются

---

## Полезные команды на сервере

```bash
# Логи
docker compose logs -f bot
docker compose logs -f postgres

# Перезапустить бота вручную
docker compose restart bot

# Остановить всё
docker compose down

# Остановить и удалить данные БД (необратимо)
docker compose down -v
```
