---
footer: false
---

# 更新教程 {#update-guide}

> 本文档介绍如何将 Xt-PMS 升级到最新版本。

## 更新方式概览 {#overview}

Xt-PMS 支持以下几种更新方式：

| 方式 | 适用场景 | 自动化程度 |
|------|----------|------------|
| Web 在线更新 | systemd / 1Panel 部署 | 一键完成 |
| Docker 更新 | Docker Compose 部署 | 两条命令 |
| 手动替换更新 | 所有部署方式 | 手动操作 |

---

## 更新前准备 {#preparation}

无论使用何种更新方式，都**强烈建议**在更新前完成以下步骤：

### 1. 备份数据库 {#backup-db}

```bash
# Docker 部署
docker exec xt-pms-mysql mysqldump -u root -p production_pms > pms_backup_$(date +%Y%m%d_%H%M%S).sql

# 裸机部署
mysqldump -u root -p production_pms > pms_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 备份配置文件 {#backup-config}

```bash
# 裸机部署
cp -r /opt/xt-pms/config /opt/xt-pms/config.bak

# Docker 部署（volume 挂载已持久化，可额外导出）
docker cp xt-pms-server:/app/config ./config.bak
```

### 3. 确认当前版本 {#check-version}

在系统管理后台 → 系统设置 → 在线更新，可查看当前版本号。或通过 API：

```bash
curl http://localhost:9898/api/system/update/check \
  -H "Authorization: Bearer <your-token>"
```

---

## Web 在线更新（推荐） {#web-update}

Xt-PMS 内置了在线更新功能，支持从 Gitee Release 自动检测、下载并安装新版本。

### 前置条件 {#web-prerequisites}

- 服务以 **systemd** 或 **supervisor 模式**部署（Docker 容器内不支持在线更新）
- 当前用户拥有 `system:settings:list` 权限（管理员默认具备）
- 服务器可访问 [Gitee API](https://gitee.com/api/v5/repos/kamyang-tech/xt-pms/releases/latest)

### 更新模式配置 {#update-mode}

在 `server/config/config.yaml` 中设置更新模式：

```yaml
app:
  update_mode: "auto"                  # auto / systemd / supervisor / docker / manual
  update_source_url: "https://gitee.com/api/v5/repos/kamyang-tech/xt-pms/releases/latest"
  service_name: "xt-pms"              # systemd 服务名
```

| 模式 | 说明 |
|------|------|
| `auto` | 自动检测运行环境（Docker > systemd > supervisor > manual） |
| `systemd` | 使用 `systemctl stop/start` 控制服务 |
| `supervisor` | 使用进程原地替换（适配 1Panel / Go 运行时面板） |
| `docker` | Docker 容器内运行，不支持在线更新 |
| `manual` | 仅下载，不自动安装 |

### 操作步骤 {#web-steps}

1. 登录系统，进入 **系统管理 → 系统设置 → 在线更新**
2. 点击 **检查更新**，系统自动查询 Gitee Release 最新版本
3. 若有新版本，点击 **下载更新**，通过进度条查看实时下载进度
4. 下载完成后，系统自动校验 SHA256
5. 点击 **立即更新**：
   - **systemd 模式**：spawn 独立子进程 → `systemctl stop xt-pms` → 解压替换文件 → `systemctl start xt-pms`
   - **supervisor/1Panel 模式**：备份旧文件 → 解压到临时目录 → 原子替换 → 进程原地重启

:::tip
Web 在线更新会自动执行 `migrations/updates/` 中的增量 SQL 迁移脚本，无需手动操作数据库。
:::

### 更新流程图 {#update-flow}

```
检查更新 → 下载更新包(SSE 实时进度) → SHA256 校验
                                               ↓
                                    ┌─ systemd ──→ spawn update-helper
                                    │              systemctl stop → 全量备份 → 解压替换 → systemctl start
              应用更新 ──────────────┼─ supervisor → 全量备份 → 解压到 staging → 原子替换目录 → syscall.Exec
                                    │
                                    └─ docker ────→ 不支持，提示手动操作
```

### 备份与失败恢复 {#web-backup}

> 系统**不提供一键自动回滚功能**。各更新方式会在替换前创建备份，但中间步骤失败不会自动恢复。

| 更新方式 | 自动备份 | 备份内容 | 失败行为 |
|----------|----------|----------|----------|
| Web 在线更新 — systemd | ✅ 全量 `cp -a` | 整个安装目录 | 不自动恢复，需手动还原备份 |
| Web 在线更新 — supervisor | ✅ 全量 `cp -a` | 整个安装目录 | 仅"激活新目录失败"时会内部回退，其余不恢复 |
| deploy.sh 覆盖安装 | ✅ `cp -a` | 整个安装目录 `.bak` | 不自动恢复 |
| quick-install.sh | ❌ | — | 不自动恢复 |
| Docker Compose 升级 | ❌ | — | 不自动恢复（数据在 volume 中持久化） |

备份路径格式为 `<安装目录>.bak.<时间戳>`，例如 `/opt/xt-pms.bak.20260724_143025`。

:::warning
备份时若磁盘空间不足，`cp -a` 会静默失败但更新继续执行。升级前请确保磁盘有足够空间。
:::

---

## Docker 更新 {#docker-update}

Docker 部署不支持在线更新，需通过 `docker compose` 拉取新镜像。

### 使用 `docker-deploy.sh` 升级 {#docker-script}

```bash
# 自动拉取最新镜像并重启
docker compose -f deploy/docker-compose.yml pull
docker compose -f deploy/docker-compose.yml up -d
```

### 手动升级步骤 {#docker-manual}

```bash
# 1. 拉取最新镜像
docker compose -f deploy/docker-compose.yml pull server

# 2. 重启服务
docker compose -f deploy/docker-compose.yml up -d server

# 3. 查看启动日志
docker compose -f deploy/docker-compose.yml logs -f server
```

:::warning
- 升级前请确保 `deploy/.env` 中已配置 `PMS_JWT_SECRET` 和 `PMS_SECURITY_PEPPER`。若首次部署未配置，升级后新容器将生成新的密钥，导致用户登录失效。
- Docker 升级不会自动备份容器内的二进制/前端文件。数据库和上传文件通过 volume 持久化，不受容器替换影响。
:::

---

## 手动更新 {#manual-update}

### 裸机 systemd 部署 {#manual-systemd}

```bash
# 1. 停止服务
sudo systemctl stop xt-pms

# 2. 备份当前文件
sudo cp -r /opt/xt-pms /opt/xt-pms.bak.$(date +%Y%m%d)

# 3. 下载最新发行版
VERSION=$(curl -s https://gitee.com/api/v5/repos/kamyang-tech/xt-pms/releases/latest | grep -o '"tag_name":"[^"]*"' | head -1 | cut -d'"' -f4)
wget https://gitee.com/kamyang-tech/xt-pms/releases/download/${VERSION}/xt-pms-${VERSION}-linux-amd64.tar.gz

# 4. 解压替换
sudo tar -xzf xt-pms-${VERSION}-linux-amd64.tar.gz -C /opt/xt-pms --strip-components=1

# 5. 启动服务
sudo systemctl start xt-pms

# 6. 查看日志确认正常
sudo journalctl -u xt-pms -f
```

### 使用快速安装脚本（自动下载最新版） {#quick-install}

```bash
# 下载并执行快速安装脚本
curl -fsSL https://gitee.com/kamyang-tech/xt-pms/raw/main/deploy/quick-install.sh -o quick-install.sh
chmod +x quick-install.sh

# 指定版本
XT_PMS_VERSION=v0.1.0-beta.1 ./quick-install.sh

# 或安装最新版（不指定版本）
./quick-install.sh
```

脚本会自动：
- 检测当前系统架构并下载对应发行版
- 校验 SHA256
- 解压并调用 `deploy.sh` 完成部署

### 面板部署（1Panel / 宝塔） {#manual-panel}

```bash
# 1. 在面板中停止 Go 服务

# 2. 备份（在服务器终端执行）
cp /opt/xt-pms/xt-pms /opt/xt-pms/xt-pms.bak
cp -r /opt/xt-pms/web /opt/xt-pms/web.bak

# 3. 下载最新发行版并解压替换
cd /tmp
wget <下载地址>
tar -xzf xt-pms-*.tar.gz
cp xt-pms-*/xt-pms /opt/xt-pms/
cp -r xt-pms-*/web/* /opt/xt-pms/web/

# 4. 在面板中启动 Go 服务
```

---

## 增量数据库迁移 {#migration}

Xt-PMS 在每次服务启动时自动执行 `migrations/updates/` 目录下的增量 SQL 迁移脚本。

### 迁移机制 {#migration-mechanism}

- 迁移脚本命名：`v<版本号>.sql`，例如 `v0.1.1.sql`
- 通过 `sys_migration` 表追踪已执行的迁移，保证幂等
- 按版本号升序执行
- 已执行的迁移不会重复执行

### 查看迁移记录 {#migration-log}

```sql
-- 查看已执行的迁移
SELECT * FROM sys_migration ORDER BY executed_at DESC;

-- 查看迁移执行详情
SELECT version, description, executed_at, duration_ms
FROM sys_migration
ORDER BY executed_at DESC;
```

---

## 版本信息 {#version-info}

### 查看当前版本 {#view-version}

**方式一：Web UI**

系统管理 → 系统设置 → 在线更新 → 当前版本

**方式二：API**

```bash
curl http://localhost:9898/api/system/update/check \
  -H "Authorization: Bearer <your-token>" \
  | jq '.data.current_version'
```

**方式三：命令行**

```bash
# 查看 VERSION 文件
cat /opt/xt-pms/VERSION

# 查看二进制编译信息（版本 / 构建时间 / Git 提交）
/opt/xt-pms/xt-pms --version 2>/dev/null || strings /opt/xt-pms/xt-pms | grep -E '^v?\d+\.'
```

### 版本号规范 {#version-format}

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- `v0.1.0-beta.1` — 预发布版本
- `v0.1.0` — 正式版本

---

## 更新失败恢复 {#recovery}

:::warning
系统**不提供一键回滚功能**。若更新后出现问题，只能使用更新前创建的备份手动恢复。请务必在更新前完成 [更新前准备](#preparation) 中的备份步骤。
:::

### 使用 Web 在线更新的自动备份恢复 {#recovery-web-backup}

Web 在线更新在执行替换前会自动备份整个安装目录，路径为 `<安装目录>.bak.<时间戳>`：

```bash
# 1. 查找自动备份
ls -d /opt/xt-pms.bak.*

# 2. 停止服务
sudo systemctl stop xt-pms

# 3. 用备份覆盖当前目录
sudo rm -rf /opt/xt-pms
sudo mv /opt/xt-pms.bak.20260724_143025 /opt/xt-pms

# 4. 启动服务
sudo systemctl start xt-pms
```

### 从手动备份恢复 {#recovery-manual-backup}

如果你在更新前按 [更新前准备](#preparation) 的指引创建了手动备份：

```bash
# 停止服务
sudo systemctl stop xt-pms

# 还原整个安装目录
sudo rm -rf /opt/xt-pms
sudo cp -a /opt/xt-pms.bak.20260724 /opt/xt-pms

# 启动服务
sudo systemctl start xt-pms
```

### Docker 回退到先前版本 {#recovery-docker}

Docker 升级没有自动备份，但可以通过指定旧版本镜像回退：

```bash
# 1. 查看本地已有的镜像版本
docker images kamyangtech/xt-pms

# 2. 修改 docker-compose.yml 中的镜像标签为旧版本
#    image: kamyangtech/xt-pms:v0.1.0-beta.1

# 3. 重新创建容器
docker compose -f deploy/docker-compose.yml up -d
```

### 数据库恢复 {#recovery-db}

增量 SQL 迁移不支持自动回退。如需恢复数据库，使用更新前备份的 SQL 文件：

```bash
mysql -u root -p production_pms < pms_backup_YYYYMMDD_HHMMSS.sql
```

---

## 常见问题 {#faq}

### Docker 容器为什么不能在线更新？ {#faq-docker}

Docker 容器遵循不可变基础设施原则，容器内修改会在容器重启后丢失。Docker 部署请使用 `docker compose pull && docker compose up -d` 进行更新。

### 在线更新后服务没有自动恢复？ {#faq-service-not-recover}

1. 检查更新模式配置是否正确：`cat /opt/xt-pms/config/config.yaml | grep update_mode`
2. 查看更新日志：`cat /tmp/xt-pms-update-helper.log`
3. 手动启动服务：
   - systemd：`sudo systemctl start xt-pms`
   - 1Panel：在面板中重新启动 Go 服务

### 更新后用户登录失败？ {#faq-login-fail}

通常是 JWT Secret 或 Pepper 变更导致：

1. 检查 `config/config.yaml` 中 `jwt.secret` 和 `security.pepper` 是否与更新前一致
2. Docker 用户检查 `deploy/.env` 中的 `PMS_JWT_SECRET` 和 `PMS_SECURITY_PEPPER` 是否正确设置
3. 确认后重启服务即可恢复

### 更新检测不到新版本？ {#faq-no-update}

1. 确认 `update_source_url` 可正常访问：
   ```bash
   curl https://gitee.com/api/v5/repos/kamyang-tech/xt-pms/releases/latest
   ```
2. Gitee API 有频率限制（未认证 60 次/小时），高频查询会返回 403
3. 如果使用 GitHub 源，可修改 `update_source_url` 为 GitHub API 地址

### 增量 SQL 迁移失败？ {#faq-migration-fail}

1. 查看启动日志中迁移相关的错误信息
2. 检查 `sys_migration` 表是否存在
3. 确认 `migrations/updates/` 目录下的 SQL 文件格式正确
4. 若迁移脚本有问题，可在 `sys_migration` 表中删除对应记录后修复脚本重试
