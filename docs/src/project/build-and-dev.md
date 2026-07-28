---
footer: false
---

# 开发与构建 {#build-and-dev}

## 环境要求 {#prerequisites}

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Go | 1.26+ | 后端运行时/编译器 |
| Node.js | >= 18.18.0 | 前端运行时/构建 |
| MySQL | 8.0 | 数据库 |
| golangci-lint | (可选) | 后端代码静态检查 |
| Docker | (可选) | 容器化部署 |

## 项目结构 {#project-structure}

```
xt-pms/
├── Makefile                  # 顶层构建入口
├── VERSION                   # 当前版本号
├── .env.example              # 根环境变量模板
├── server/                   # Go 后端 (Gin + GORM)
│   ├── Makefile              # 后端专用构建目标
│   ├── go.mod / go.sum
│   ├── cmd/                  # 入口 (main.go)
│   ├── config/               # 配置加载 (支持 YAML + 环境变量)
│   ├── internal/             # 私有代码
│   │   ├── controller/       # HTTP 控制器
│   │   ├── service/          # 业务逻辑
│   │   ├── dao/              # 数据访问层 (GORM)
│   │   ├── model/            # 实体 & DTO
│   │   ├── router/           # 路由注册
│   │   ├── common/           # 中间件 / 响应 / 监控
│   │   ├── installer/        # Web 安装向导
│   │   └── job/              # 定时任务 (cron)
│   ├── pkg/logger/           # 日志 (Zap + Lumberjack)
│   └── migrations/           # SQL 建表 & 默认数据
├── web/                      # Vue 3 前端 (TDesign)
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── api/              # API 封装 (Axios)
│   │   ├── pages/            # 页面组件
│   │   ├── router/           # 模块化路由
│   │   ├── store/            # Pinia 状态管理
│   │   ├── components/       # 公共组件
│   │   ├── layouts/          # 布局组件
│   │   └── locales/          # 国际化 (vue-i18n)
│   └── .env.development / .env.production
├── deploy/                   # 部署配置
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── nginx.conf
│   └── xt-pms.service
└── scripts/
    └── clean_comments.py
```

---

## 快速开始 {#quick-start}

### 1. 安装依赖 {#install-deps}

```bash
make setup
```

该命令等价于：

```bash
cd web && npm install
cd server && go mod tidy
```

### 2. 配置数据库 {#configure-db}

复制配置模板并修改数据库连接信息：

```bash
cp server/config/config.yaml.example server/config/config.yaml
```

编辑 `server/config/config.yaml`，修改 `database` 部分：

```yaml
database:
  host: 127.0.0.1
  port: 3306
  user: your_database_user
  password: your_database_password
  dbname: production_pms
```

也可以通过根目录 `.env` 文件注入数据库配置（优先级更高）：

```bash
cp .env.example .env
# 编辑 .env 中的数据库密码等信息
```

配置优先级：**OS 环境变量 > `.env` 文件 > `config.yaml`**

支持的环境变量：

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `PMS_DB_HOST` | 数据库地址 | `127.0.0.1` |
| `PMS_DB_PORT` | 数据库端口 | `3306` |
| `PMS_DB_USER` | 数据库用户 | — |
| `PMS_DB_PASSWORD` | 数据库密码 | — |
| `PMS_DB_NAME` | 数据库名 | `production_pms` |
| `PMS_JWT_SECRET` | JWT 签名密钥 | — |
| `PMS_SECURITY_PEPPER` | 密码加密 Pepper | — |
| `PMS_APP_MODE` | 运行模式 | `development` |
| `PMS_SERVER_PORT` | 服务端口 | `9898` |
| `PMS_LOG_LEVEL` | 日志级别 | `debug` |

### 3. 启动开发服务 {#start-dev}

**启动后端**（终端 1）：

```bash
make run/server
```

后端默认监听 `0.0.0.0:9898`，启动后如果检测到未安装（`config/.installed` 文件不存在），会自动启动 Web 安装向导。

**启动前端**（终端 2）：

```bash
make run/web
```

前端 Vite 开发服务器运行在 `http://localhost:9800`，通过 Vite 代理将 `/api` 等请求转发到后端 `http://127.0.0.1:9898`。

---

## 构建 {#build}

### 构建类型对比 {#build-comparison}

| 目标 | 命令 | 产物位置与说明 |
|------|------|----------------|
| 本地开发构建 | `make build` | `server/bin/xt-pms` + `web/dist/`<br>DevBuild 模式，跳过安装向导 |
| Linux 交叉编译 | `make build/linux` | `server/bin/xt-pms` + `web/dist/`<br>Linux amd64，开发测试用 |
| 生产发行版 | `make release` | `dist/xt-pms-<version>-linux-amd64.tar.gz`<br>前端嵌入后端单二进制，含部署脚本 |

### 仅构建前端 {#build-web-only}

```bash
make build/web
```

等价于：

```bash
cd web && VITE_APP_VERSION=$(cat ../VERSION) npm run build
```

- 执行 TypeScript 类型检查 (`vue-tsc --noEmit`)
- 使用 Terser 压缩，移除 `console` / `debugger`
- 产物输出到 `web/dist/`

### 仅构建后端 {#build-server-only}

```bash
# 当前系统（开发模式，DevBuild=true，跳过安装向导）
make build/server

# Linux amd64（开发模式）
make build/server/linux

# Linux amd64（生产模式，包含前端嵌入）
make build/server/release
```

后端编译时通过 `-ldflags` 注入版本信息：

| 注入变量 | 内容 |
|----------|------|
| `Version` | 来自 `VERSION` 文件 |
| `BuildTime` | UTC 构建时间 |
| `GitCommit` | 当前 Git commit 短哈希 |
| `DevBuild` | 开发构建标记（`true` 时跳过安装向导） |

开发构建 (`DevBuild=true`) 会跳过安装向导步骤，方便本地反复启动。生产构建 (`-tags release`) 会将 `web/dist/` 目录嵌入到二进制中，实现单文件部署。

### 构建发行版 {#build-release}

```bash
make release
```

完整流程：

1. **构建前端** — Vite 生产构建 → `web/dist/`
2. **编译后端** — 将 `web/dist/` 复制到 `cmd/web-dist/`，以 `-tags release` 编译
3. **文件检查** — 校验二进制、前端产物、SQL 脚本、部署模板是否齐全
4. **打包压缩** — 生成 `dist/xt-pms-<version>-linux-amd64.tar.gz` 和 `sha256` 校验文件

发行版包内包含：

```
xt-pms-0.1.0-beta.1-linux-amd64/
├── xt-pms                    # 后端二进制（内嵌前端）
├── VERSION                   # 版本号
├── DEPLOY.md                 # 部署指南
├── deploy.sh                 # 一键部署脚本
├── deploy/
│   ├── xt-pms.service        # systemd 服务单元
│   └── nginx.conf            # Nginx 反向代理配置
├── web/                      # 前端静态文件
├── migrations/
│   ├── init_schema.sql       # 建表 DDL
│   ├── init_seed.sql         # 默认数据
│   └── updates/              # 增量迁移脚本（如有）
└── system-assets/
    └── logo.svg              # 系统 Logo
```

---

## 运行 {#run}

### 后端 {#run-backend}

```bash
# go run（development 模式）
make run/server

# 或直接使用 go run
cd server && go run ./cmd

# 编译后以 production 模式启动
cd server && make run/prod
```

子命令（在 `server/cmd/main.go` 中定义）：

```bash
# Docker 自动创建管理员
./xt-pms setup-admin

# 重置用户密码
./xt-pms reset-password

# 在线更新
./xt-pms update-helper
```

### 前端 {#run-frontend}

```bash
make run/web
```

等价于：

```bash
cd web && npm run dev
```

Vite dev server 默认端口 `9800`，监听 `0.0.0.0`。

代理配置（见 `web/vite.config.ts`）：

| 本地路径 | 代理目标 |
|----------|----------|
| `/api` | `http://127.0.0.1:9898` |
| `/uploads` | `http://127.0.0.1:9898` |
| `/system-assets` | `http://127.0.0.1:9898` |
| `/health` | `http://127.0.0.1:9898` |

### Docker 开发环境 {#docker-dev}

使用开发 Compose 文件启动全套服务（MySQL + 后端）：

```bash
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.dev.yml up -d
```

开发模式下会自动挂载 SQL 初始化脚本并构建本地镜像。

---

## 测试 {#test}

### 后端测试 {#test-server}

```bash
# 运行所有测试
make test/server

# 跳过集成测试（快速）
cd server && make test/short

# 生成覆盖率报告
make test/cover

# 运行指定包的测试
cd server && make test/pkg PKG=./internal/service
```

覆盖率报告输出：
- `server/bin/cover.out` — 文本格式
- `server/bin/cover.html` — HTML 可视化报告

### 前端测试 {#test-web}

```bash
make test/web
```

> 当前前端测试尚未实现，该命令输出占位提示。

---

## 代码检查 {#lint}

### 后端 {#lint-server}

```bash
# 代码静态检查（需安装 golangci-lint）
make lint/server

# 自动修复
cd server && make lint/fix

# Go 原生 vet
cd server && make vet
```

首次使用需安装 `golangci-lint`：

```bash
# macOS
brew install golangci-lint

# Linux
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin
```

### 前端 {#lint-web}

```bash
make lint/web
```

前端代码检查工具栈：

| 工具 | 命令 | 用途 |
|------|------|------|
| ESLint | `npm run lint` | JS/TS/Vue 语法规范 |
| Stylelint | `npm run stylelint` | CSS/Less 样式规范 |
| Prettier | 通过 ESLint 集成 | 代码格式化 |
| Husky | 自动安装 | Git hooks |
| Commitlint | 自动安装 | 提交信息规范 |
| lint-staged | 自动安装 | 暂存区文件检查 |

---

## Docker {#docker}

```bash
# 构建镜像
make docker/build

# 启动服务（首次自动从 .env.example 复制 deploy/.env）
make docker/up

# 停止服务
make docker/down

# 查看日志
make docker/logs
```

Docker Compose 服务架构：

```
                    ┌─────────────┐
                    │  Nginx:80   │ (可选反向代理)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Server:9898 │ (后端，内嵌前端 SPA)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  MySQL:3306 │
                    └─────────────┘
```

部署前需在 `deploy/.env` 中配置敏感信息（数据库密码、JWT Secret 等），具体见 `deploy/.env.example`。

---

## 清理 {#clean}

```bash
# 清理所有产物
make clean

# 仅清理后端
make clean/server

# 仅清理前端
make clean/web

# 清理发行版打包产物
make clean/release
```

---

## 依赖管理 {#deps}

```bash
# Go 依赖同步
make tidy
# 等价于: cd server && go mod tidy

# Go 依赖更新
cd server && go get -u ./... && go mod tidy

# 前端依赖更新
cd web && npm update
```

---

## 常见问题 {#faq}

### 端口冲突 {#port-conflict}

- 后端默认端口 `9898`，前端 `9800`
- 修改后端端口：在 `server/config/config.yaml` 中修改 `server.port`，或设置环境变量 `PMS_SERVER_PORT`
- 修改前端端口：编辑 `web/vite.config.ts` 中的 `server.port`

### CORS 跨域 {#cors}

开发环境下，前端 Vite 已配置代理，无需关心。如需前后端分离部署，在 `server/config/config.yaml` 的 `cors.allowed_origins` 中添加前端域名：

```yaml
cors:
  allowed_origins:
    - "http://localhost:9800"
    - "https://your-domain.com"
```

### 首次启动提示安装 {#first-install}

后端启动时会检查 `config/.installed` 文件：
- 不存在 → 启动 Web 安装向导（日志中会输出含 token 的安装地址）
- 已存在 → 直接启动服务

本地开发构建会注入 `DevBuild=true`，跳过安装向导。用 `go run ./cmd` 或直接运行编译后的二进制则不会跳过。

### 数据库编码 {#db-charset}

请确保数据库使用 `utf8mb4`：

```sql
CREATE DATABASE production_pms
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Go 版本不匹配 {#go-version}

项目要求 Go 1.26+，如本地版本较低：

```bash
# 使用 gvm 管理多版本
gvm install go1.26.1
gvm use go1.26.1

# 或从官网下载
# https://go.dev/dl/
```
