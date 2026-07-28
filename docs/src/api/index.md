# API 接口文档 {#api}

本文档描述 xt-pms（小微模具制造与注塑企业生产管理系统）后端 HTTP 接口的整体结构、模块划分与各端点的用途。其目的在于为前端对接、第三方集成与测试提供统一的接口索引。

> **数据来源与约定**
> - 接口定义来自 `server/internal/router/*` 的路由注册，服务基于 Gin 框架，所有业务接口挂载在根路径 `/api` 之下（另有少量根路径公开端点，见对应章节）。
> - 路由中的路径参数使用 Gin 语法（如 `:id`、`orderId`），调用时替换为实际值。
> - 大部分接口需要 **JWT 认证**（请求头 `Authorization: Bearer <token>`）；少数公开接口（登录、验证码、字典版本、系统信息、外发公开报工、健康检查）无需认证，已在各章节标注。
> - 接口访问同时受**菜单权限**控制（`middleware.RequirePerm` / `RequireAnyPerm`）；写操作通常同时接受对应 `:list` 权限，便于"列表页内联提交"。权限码形如 `mold:mold:list`，详见各章节。

---

## 通用约定 {#conventions}

- **Base URL**：`http://<host>:<port>/api`
- **认证**：除特别标注为「公开」的接口外，均需在请求头携带 `Authorization: Bearer <token>`。
- **路径参数**：以 `:param` 形式出现（如 `/mold/:id` 中的 `:id`）。
- **请求体**：写操作（`POST`/`PUT`）一般接收 `application/json` 主体。
- **权限**：端点说明中的「权限」列给出该接口依赖的权限码（以 `system:user:list` 这类格式表示，部分写操作以 `RequireAnyPerm` 同时放行 `:list` 权限）。

---

## 系统 / 认证 (system) {#system}

系统模块包含登录认证、用户/角色/部门/菜单管理、字典与配置、通知、操作日志、收款账户、系统更新等。路由组前缀 `/system`。

公开接口（无需 JWT）：

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/system/captcha` | 获取登录图形验证码（带 IP 限流） |
| `POST` | `/system/login` | 用户登录获取 JWT（带 IP 限流，每 IP 每分钟最多 10 次） |
| `GET` | `/system/dict/version` | 查询字典版本（供前端轮询；无需 JWT） |
| `GET` | `/system/system-info` | 获取系统信息配置（无需 JWT） |

需认证接口：

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/system/profile` | 登录即可 | 获取当前用户信息 |
| `PUT` | `/system/profile` | 登录即可 | 更新当前用户 |
| `POST` | `/system/profile/password` | 登录即可 | 修改密码 |
| `GET` | `/system/profile/statistics` | 登录即可 | 获取个人统计 |
| `GET` | `/system/users` | `system:user:list` | 用户列表 |
| `GET` | `/system/users/:id` | `system:user:list` | 用户详情 |
| `POST` | `/system/users` | `system:user:create` | 创建用户 |
| `PUT` | `/system/users` | `system:user:update` | 更新用户 |
| `DELETE` | `/system/users/:id` | `system:user:delete` | 删除用户 |
| `PUT` | `/system/users/status` | `system:user:update` | 批量更新用户状态 |
| `PUT` | `/system/users/:id/reset-pwd` | `system:user:update` | 重置密码 |
| `PUT` | `/system/users/:id/unlock` | `system:user:update` | 解锁用户 |
| `GET` | `/system/roles` | `system:role:list` | 角色列表 |
| `GET` | `/system/roles/:id` | `system:role:list` | 角色详情 |
| `POST` | `/system/roles` | `system:role:create` | 创建角色 |
| `PUT` | `/system/roles` | `system:role:update` | 更新角色 |
| `DELETE` | `/system/roles/:id` | `system:role:delete` | 删除角色 |
| `GET` | `/system/depts` | `system:dept:list` | 部门列表 |
| `GET` | `/system/depts/:id` | `system:dept:list` | 部门详情 |
| `POST` | `/system/depts` | `system:dept:list` | 创建部门 |
| `PUT` | `/system/depts` | `system:dept:list` | 更新部门 |
| `DELETE` | `/system/depts/:id` | `system:dept:list` | 删除部门 |
| `PUT` | `/system/depts/:id/status` | `system:dept:list` | 更新部门状态 |
| `GET` | `/system/company` | 登录即可 | 获取公司信息 |
| `PUT` | `/system/company` | `system:company:list` | 更新公司信息 |
| `POST` | `/system/company/logo` | `system:company:list` | 上传公司 Logo |
| `DELETE` | `/system/company/logo` | `system:company:list` | 删除公司 Logo |
| `GET` | `/system/menus` | 登录即可 | 获取当前用户菜单树 |
| `GET` | `/system/menus/:id` | `system:menu:list` | 菜单详情 |
| `POST` | `/system/menus` | `system:menu:create` | 创建菜单 |
| `PUT` | `/system/menus` | `system:menu:update` | 更新菜单 |
| `DELETE` | `/system/menus/:id` | `system:menu:delete` | 删除菜单 |
| `GET` | `/system/role-menus/tree` | `system:role:assign-perm` | 角色菜单树 |
| `GET` | `/system/roles/:id/menus` | `system:role:assign-perm` | 角色已分配菜单 |
| `POST` | `/system/role-menus` | `system:role:assign-perm` | 分配角色菜单 |
| `GET` | `/system/user/permissions` | 登录用户必调 | 获取当前用户权限 |
| `GET` | `/system/dict-types` | `system:dict:list` | 字典类型列表 |
| `GET` | `/system/dict-types/:id` | `system:dict:list` | 字典类型详情 |
| `POST` | `/system/dict-types` | `system:dict:list` | 创建字典类型 |
| `PUT` | `/system/dict-types` | `system:dict:list` | 更新字典类型 |
| `DELETE` | `/system/dict-types/:id` | `system:dict:list` | 删除字典类型 |
| `GET` | `/system/dict-data` | `system:dict:list` | 按类型查字典数据 |
| `GET` | `/system/dict-data-by-id` | `system:dict:list` | 按 ID 查字典数据 |
| `GET` | `/system/dict-data-page` | `system:dict:list` | 字典数据分页 |
| `PUT` | `/system/dict-data` | `system:dict:list` | 更新字典数据（系统内置状态只读+可编辑颜色/备注） |
| `POST` | `/system/dict-data/clear-cache` | `system:dict:list` | 清除字典缓存 |
| `POST` | `/system/dict-data/restore-seed` | `system:dict:list` | 恢复字典种子 |
| `POST` | `/system/dict-data/restore-production-seed` | `system:dict:list` | 恢复生产字典种子 |
| `POST` | `/system/business-dict-data` | `system:dict:list` | 创建业务字典数据 |
| `PUT` | `/system/business-dict-data` | `system:dict:list` | 更新业务字典数据 |
| `DELETE` | `/system/business-dict-data/:id` | `system:dict:list` | 删除业务字典数据 |
| `GET` | `/system/status-flow-configs` | `system:process-template:list` | 状态流转配置列表 |
| `GET` | `/system/status-flow-configs/:id` | `system:process-template:list` | 状态流转配置详情 |
| `GET` | `/system/print-notice-config` | `system:print-config:list` | 获取打印通知单配置 |
| `POST` | `/system/print-notice-config` | `system:print-config:list` | 保存打印通知单配置 |
| `POST` | `/system/print-notice-config/reset` | `system:print-config:list` | 重置打印通知单配置 |
| `PUT` | `/system/system-info` | `system:settings:list` | 更新系统信息 |
| `POST` | `/system/favicon` | `system:settings:list` | 上传站点图标 |
| `DELETE` | `/system/favicon` | `system:settings:list` | 删除站点图标 |
| `POST` | `/system/cleanup-orphan-files` | `system:settings:list` | 清理孤立文件 |
| `GET` | `/system/cleanup-orphan-files/count` | `system:settings:list` | 孤立文件计数 |
| `GET` | `/system/cleanup-config` | `system:settings:list` | 获取清理配置 |
| `PUT` | `/system/cleanup-config` | `system:settings:list` | 更新清理配置 |
| `GET` | `/system/security-config` | `system:settings:list` | 获取安全配置 |
| `PUT` | `/system/security-config` | `system:settings:list` | 更新安全配置 |
| `GET` | `/system/notifications` | 登录即可 | 通知分页 |
| `GET` | `/system/notifications/types` | 登录即可 | 通知类型 |
| `GET` | `/system/notifications/unread-count` | 登录即可 | 未读通知数 |
| `PUT` | `/system/notifications/:id/read` | 登录即可 | 标记已读 |
| `PUT` | `/system/notifications/read-all` | 登录即可 | 全部已读 |
| `DELETE` | `/system/notifications/:id` | 登录即可 | 删除通知 |
| `POST` | `/system/notifications/test` | 登录即可 | 测试发送通知 |
| `GET` | `/system/notification-configs` | 登录即可 | 通知配置列表 |
| `GET` | `/system/notification-configs/types` | 登录即可 | 通知配置类型 |
| `POST` | `/system/notification-configs` | 登录即可 | 创建通知配置 |
| `PUT` | `/system/notification-configs` | 登录即可 | 更新通知配置 |
| `DELETE` | `/system/notification-configs/:id` | 登录即可 | 删除通知配置 |
| `GET` | `/system/oper-logs` | `system:oper-log:list` | 操作日志列表 |
| `GET` | `/system/oper-logs/:id` | `system:oper-log:list` | 操作日志详情 |
| `GET` | `/system/oper-log/export` | `system:oper-log:list` | 导出操作日志 |
| `GET` | `/system/oper-log/oper-types` | `system:oper-log:list` | 操作类型选项 |
| `GET` | `/system/receiving-accounts` | `system:receiving-account:list` | 收款账户列表 |
| `GET` | `/system/receiving-accounts/:id` | `system:receiving-account:list` | 收款账户详情 |
| `POST` | `/system/receiving-accounts` | `system:receiving-account:list` | 创建收款账户 |
| `PUT` | `/system/receiving-accounts` | `system:receiving-account:list` | 更新收款账户 |
| `DELETE` | `/system/receiving-accounts/:id` | `system:receiving-account:list` | 删除收款账户 |
| `POST` | `/system/receiving-accounts/batch-delete` | `system:receiving-account:list` | 批量删除收款账户 |
| `PUT` | `/system/receiving-accounts/:id/status` | `system:receiving-account:list` | 更新收款账户状态 |
| `GET` | `/system/update/check` | `system:settings:list` | 检查系统更新 |
| `POST` | `/system/update/download` | `system:settings:list` | 下载更新包 |
| `POST` | `/system/update/apply` | `system:settings:list` | 应用更新 |
| `POST` | `/system/update/restart` | `system:settings:list` | 重启服务 |
| `GET` | `/system/update/install-info` | `system:settings:list` | 获取安装信息 |

---

## 基础资料 (basic) {#basic}

基础资料模块管理客户、仓库、工序、供应商、加工商等主数据。路由组前缀 `/basic`。列表/写操作权限统一为对应 `:list` 权限。

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/basic/customer` | `system:customer:list` | 客户列表 |
| `GET` | `/basic/customer/:id` | `system:customer:list` | 客户详情 |
| `POST` | `/basic/customer` | `system:customer:list` | 创建客户 |
| `PUT` | `/basic/customer` | `system:customer:list` | 更新客户 |
| `DELETE` | `/basic/customer/:id` | `system:customer:list` | 删除客户 |
| `POST` | `/basic/customer/batch-delete` | `system:customer:list` | 批量删除客户 |
| `GET` | `/basic/warehouse` | `system:warehouse:list` | 仓库列表 |
| `GET` | `/basic/warehouse/:id` | `system:warehouse:list` | 仓库详情 |
| `POST` | `/basic/warehouse` | `system:warehouse:list` | 创建仓库 |
| `PUT` | `/basic/warehouse` | `system:warehouse:list` | 更新仓库 |
| `DELETE` | `/basic/warehouse/:id` | `system:warehouse:list` | 删除仓库 |
| `POST` | `/basic/warehouse/batch-delete` | `system:warehouse:list` | 批量删除仓库 |
| `GET` | `/basic/process` | `system:process-template:list` | 工序列表 |
| `GET` | `/basic/process/:id` | `system:process-template:list` | 工序详情 |
| `POST` | `/basic/process` | `system:process-template:list` | 创建工序 |
| `PUT` | `/basic/process` | `system:process-template:list` | 更新工序 |
| `DELETE` | `/basic/process/:id` | `system:process-template:list` | 删除工序 |
| `GET` | `/basic/supplier` | `system:processor-supplier:list` | 供应商列表 |
| `GET` | `/basic/supplier/:id` | `system:processor-supplier:list` | 供应商详情 |
| `POST` | `/basic/supplier` | `system:processor-supplier:list` | 创建供应商 |
| `PUT` | `/basic/supplier` | `system:processor-supplier:list` | 更新供应商 |
| `DELETE` | `/basic/supplier/:id` | `system:processor-supplier:list` | 删除供应商 |
| `POST` | `/basic/supplier/batch-delete` | `system:processor-supplier:list` | 批量删除供应商 |
| `GET` | `/basic/processor` | `system:processor-supplier:list` | 加工商列表 |
| `GET` | `/basic/processor/:id` | `system:processor-supplier:list` | 加工商详情 |
| `POST` | `/basic/processor` | `system:processor-supplier:list` | 创建加工商 |
| `PUT` | `/basic/processor` | `system:processor-supplier:list` | 更新加工商 |
| `DELETE` | `/basic/processor/:id` | `system:processor-supplier:list` | 删除加工商 |
| `POST` | `/basic/processor/batch-delete` | `system:processor-supplier:list` | 批量删除加工商 |

---

## 模具管理 (mold) {#mold}

模具模块覆盖模具档案、模具订单、模具工单、工单工序、试模、交付、库存、图片、产品关联、订单款项与工序模板。路由组前缀 `/mold`，另有独立的 `/mold-product-relation`、`/mold-order`、`/process-template` 子组。

### 模具档案 / 订单 / 工单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/mold` | `mold:mold:list` | 模具列表 |
| `GET` | `/mold/statistics` | `mold:mold:list` | 模具统计 |
| `GET` | `/mold/:id` | `mold:mold:list` | 模具详情 |
| `POST` | `/mold` | `mold:mold:create` 或 `:list` | 创建模具 |
| `PUT` | `/mold` | `mold:mold:update` 或 `:list` | 更新模具 |
| `DELETE` | `/mold/:id` | `mold:mold:delete` 或 `:list` | 删除模具 |
| `GET` | `/mold/orders` | `mold:order:list` | 模具订单列表 |
| `GET` | `/mold/order/:id` | `mold:order:list` | 模具订单详情 |
| `POST` | `/mold/orders/fix-status` | `mold:order:update` 或 `:list` | 修复订单状态 |
| `POST` | `/mold/order` | `mold:order:create` 或 `:list` | 创建模具订单 |
| `PUT` | `/mold/order` | `mold:order:update` 或 `:list` | 更新模具订单 |
| `DELETE` | `/mold/order/:id` | `mold:order:delete` 或 `:list` | 删除模具订单 |
| `GET` | `/mold/work-orders` | `mold:work-order:list` | 模具工单列表 |
| `GET` | `/mold/work-order/:id` | `mold:work-order:list` | 模具工单详情 |
| `POST` | `/mold/work-order` | `mold:work-order:create` 或 `:list` | 创建模具工单 |
| `PUT` | `/mold/work-order` | `mold:work-order:update` 或 `:list` | 更新模具工单 |
| `DELETE` | `/mold/work-order/:id` | `mold:work-order:delete` 或 `:list` | 删除模具工单 |
| `POST` | `/mold/work-order/cancel` | `mold:work-order:update` 或 `:list` | 取消模具工单 |
| `GET` | `/mold/work-order/:id/processes` | `mold:work-order:list` | 工单工序列表 |
| `POST` | `/mold/work-order/process/toggle` | `mold:work-order:list` | 切换工序完成状态 |

### 试模 / 交付 / 库存 / 图片

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/mold/try-tests` | `mold:mold:list` | 试模记录列表 |
| `POST` | `/mold/try-test` | `mold:mold:list` | 创建试模记录 |
| `PUT` | `/mold/try-test/:id` | `mold:mold:list` | 更新试模记录 |
| `DELETE` | `/mold/try-test/:id` | `mold:mold:list` | 删除试模记录 |
| `GET` | `/mold/deliveries` | `mold:mold:list` | 模具交付列表 |
| `POST` | `/mold/delivery` | `mold:mold:list` | 创建模具交付 |
| `GET` | `/mold/stocks` | `mold:mold:list` | 模具库存列表 |
| `POST` | `/mold/stock` | `mold:mold:list` | 创建模具库存变更 |
| `GET` | `/mold/:id/images` | `mold:mold:list` | 模具图片列表 |
| `POST` | `/mold/:id/images/attach` | `mold:mold:list` | 关联图片文件 |
| `DELETE` | `/mold/images/:imageId` | `mold:mold:list` | 删除模具图片 |
| `PUT` | `/mold/:id/images/:imageId/primary` | `mold:mold:list` | 设置主图 |

### 模具产品关联 / 订单款项 / 工序模板

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/mold-product-relation/by-mold` | `mold:mold:list` | 按模具查产品关联 |
| `GET` | `/mold-product-relation/by-product` | `mold:mold:list` | 按产品查模具关联 |
| `GET` | `/mold-product-relation/by-item` | `mold:mold:list` | 按订单明细查关联 |
| `POST` | `/mold-product-relation` | `mold:mold:list` | 创建关联 |
| `DELETE` | `/mold-product-relation/:id` | `mold:mold:list` | 删除关联 |
| `GET` | `/mold-order/:orderId/payments` | `mold:order:list` | 订单款项列表 |
| `GET` | `/mold-order/payments/by-work-order/:workOrderId` | `mold:order:list` | 按工单查款项 |
| `GET` | `/mold-order/payments/:id` | `mold:order:list` | 款项详情 |
| `POST` | `/mold-order/payments` | `mold:order:list` | 创建款项 |
| `PUT` | `/mold-order/payments/:id` | `mold:order:list` | 更新款项 |
| `DELETE` | `/mold-order/payments/:id` | `mold:order:list` | 删除款项 |
| `GET` | `/mold-order/:orderId/payment-stats` | `mold:order:list` | 款项统计 |
| `POST` | `/mold-order/payments/replace-by-work-order` | `mold:order:list` | 按工单替换款项 |
| `GET` | `/process-template` | `system:process-template:list` | 工序模板列表 |
| `GET` | `/process-template/active` | `system:process-template:list` | 启用中的工序模板 |
| `POST` | `/process-template` | `system:process-template:list` | 创建工序模板 |
| `PUT` | `/process-template` | `system:process-template:list` | 更新工序模板 |
| `DELETE` | `/process-template/:id` | `system:process-template:list` | 删除工序模板 |

---

## 产品管理 (product) {#product}

产品模块管理产品档案、产品 BOM 与产品库存。路由组前缀 `/product`；库存相关接口复用 `production:stock:list` 权限。

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/product` | `product:list` | 产品列表 |
| `POST` | `/product/sync` | `product:list` | 同步产品 |
| `GET` | `/product/:id` | `product:list` | 产品详情 |
| `POST` | `/product` | `product:list` | 创建产品 |
| `PUT` | `/product` | `product:list` | 更新产品 |
| `DELETE` | `/product/:id` | `product:list` | 删除产品 |
| `GET` | `/product/generate-code` | `product:list` | 生成产品编码 |
| `GET` | `/product/boms` | `product:list` | 产品 BOM 列表 |
| `POST` | `/product/bom` | `product:list` | 创建产品 BOM |
| `PUT` | `/product/bom` | `product:list` | 更新产品 BOM |
| `DELETE` | `/product/bom/:id` | `product:list` | 删除产品 BOM |
| `GET` | `/product/stocks` | `production:stock:list` | 产品库存列表 |
| `GET` | `/product/stocks/:id` | `production:stock:list` | 库存详情 |
| `POST` | `/product/stock` | `production:stock:list` | 创建库存 |
| `PUT` | `/product/stock` | `production:stock:list` | 更新库存 |
| `POST` | `/product/stock/in` | `production:stock:list` | 产品入库 |
| `POST` | `/product/stock/out` | `production:stock:list` | 产品出库 |
| `GET` | `/product/stock/safe-check` | `production:stock:list` | 安全库存检查 |

---

## 生产管理 (production) {#production}

生产模块覆盖生产订单全生命周期、生产报工、外发加工、模具使用记录、库存出入库、外来模具档案等。路由组前缀 `/production`。

### 生产订单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/production/orders` | `production:order:list` | 生产订单列表 |
| `GET` | `/production/orders/:id` | `production:order:list` | 生产订单详情 |
| `GET` | `/production/mold/:mold_id/production-items` | `production:order:list` | 按模具查生产明细 |
| `POST` | `/production/order` | `production:order:create` 或 `:list` | 创建生产订单 |
| `PUT` | `/production/order` | `production:order:update` 或 `:list` | 更新生产订单 |
| `DELETE` | `/production/order/:id` | `production:order:delete` 或 `:list` | 取消生产订单 |
| `POST` | `/production/order/:id/start` | `production:order:update` 或 `:list` | 开始生产 |
| `POST` | `/production/order/:id/complete` | `production:order:update` 或 `:list` | 完成生产 |
| `POST` | `/production/order/stock-in` | `production:order:update` 或 `:list` | 生产入库 |
| `POST` | `/production/order/:id/shipment` | `production:order:update` 或 `:list` | 发货 |
| `POST` | `/production/order/:id/finish` | `production:order:update` 或 `:list` | 完结订单 |
| `POST` | `/production/order/:id/replenish` | `production:order:update` 或 `:list` | 补货发货 |
| `POST` | `/production/order/item/:item_id/finish` | `production:order:update` 或 `:list` | 完结订单明细 |
| `GET` | `/production/order/:id/actions` | `production:order:list` | 获取可用操作 |

### 生产报工 / 外发 / 模具使用 / 统计

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `POST` | `/production/report` | `production:work-report:submit` 或 `:list` | 提交生产报工 |
| `GET` | `/production/reports` | `production:work-report:list` | 报工列表 |
| `GET` | `/production/outsourcing` | `production:order:list` | 外发记录列表 |
| `GET` | `/production/outsourcing/list` | `production:order:list` | 按类型查外发记录 |
| `POST` | `/production/outsourcing` | `production:order:create` 或 `:list` | 创建外发记录 |
| `POST` | `/production/outsourcing/:id/send` | `production:order:update` 或 `:list` | 发出外发 |
| `POST` | `/production/outsourcing/:id/receive` | `production:order:update` 或 `:list` | 收回外发 |
| `POST` | `/production/outsourcing/:id/report` | `production:order:update` 或 `:list` | 外发报工 |
| `POST` | `/production/outsourcing/:id/share-token` | `production:order:update` 或 `:list` | 生成分享令牌 |
| `POST` | `/production/outsourcing/:id/regenerate-token` | `production:order:update` 或 `:list` | 重新生成分享令牌 |
| `GET` | `/production/outsourcing/:id/reports` | `production:order:list` | 外发报工列表 |
| `POST` | `/production/mold-usage` | `production:order:create` 或 `:list` | 创建模具使用记录 |
| `GET` | `/production/mold/:mold_id/usage-history` | `mold:usage-history:list` | 模具使用历史 |
| `GET` | `/production/mold/usage-history` | `mold:usage-history:list` | 模具使用历史（全部） |
| `GET` | `/production/mold/:mold_id/usage-stats` | `mold:usage-history:list` | 模具使用统计 |
| `GET` | `/production/statistics` | `production:order:list` | 生产统计 |

### 库存 / 出入库 / 外来模具

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/production/stock/product-list` | `production:stock:list` | 产品库存列表 |
| `POST` | `/production/stock/delete` | `production:stock:out` 或 `:list` | 删除库存 |
| `GET` | `/production/stock/ext/:external_mold_code/records` | `production:stock:list` | 按外来模具编码查库存记录 |
| `GET` | `/production/stock/:mold_id/records` | `production:stock:list` | 按模具查库存记录 |
| `GET` | `/production/stock-in/list` | `production:stock:list` | 入库单列表 |
| `GET` | `/production/stock-in/:id` | `production:stock:list` | 入库单详情 |
| `PUT` | `/production/stock-in` | `production:stock:in` 或 `:list` | 更新入库单 |
| `POST` | `/production/stock/direct` | `production:stock:in` 或 `:list` | 直接入库 |
| `POST` | `/production/stock/check` | `production:stock:in` 或 `:list` | 库存盘点 |
| `GET` | `/production/stock/statistics` | `production:stock:list` | 库存统计 |
| `GET` | `/production/stock/trend` | `production:stock:list` | 库存趋势 |
| `POST` | `/production/stock-out` | `production:stock-out:create` 或 `:list` | 出库 |
| `GET` | `/production/stock-out/list` | `production:stock-out:list` | 出库单列表 |
| `GET` | `/production/stock-out/:id` | `production:stock-out:list` | 出库单详情 |
| `PUT` | `/production/stock-out/:id` | `production:stock-out:update` 或 `:list` | 更新出库单 |
| `GET` | `/production/stock-out/mold/:mold_id/records` | `production:stock-out:list` | 按模具查出库记录 |
| `GET` | `/production/stock-out/ext/:external_mold_code/records` | `production:stock-out:list` | 按外来模具编码查出库记录 |
| `GET` | `/production/stock-out/recognize-express` | `production:stock-out:list` | 识别快递公司 |
| `POST` | `/production/stock-out/list-for-print` | `production:stock-out:list` | 打印用出库列表 |
| `POST` | `/production/stock/current` | `production:stock-out:list` | 当前库存 |
| `GET` | `/production/external-mold-archive/query` | `production:order:list` | 按编码查外来模具档案 |
| `GET` | `/production/external-mold-archive/list` | `production:order:list` | 外来模具档案列表 |
| `PUT` | `/production/external-mold-archive/:id` | `production:order:list` | 更新外来模具档案 |
| `DELETE` | `/production/external-mold-archive/:id` | `production:order:list` | 删除外来模具档案 |

---

## 综合订单 (master order) {#master-order}

综合订单将模具订单与生产订单合并管理，实现"先制模具、后做产品"的一体化流程。路由组前缀 `/master-orders`，权限统一为 `order-management:list`。

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `POST` | `/master-orders` | `order-management:list` | 创建综合订单 |
| `GET` | `/master-orders` | `order-management:list` | 综合订单列表 |
| `GET` | `/master-orders/:id` | `order-management:list` | 综合订单详情 |
| `PUT` | `/master-orders/:id` | `order-management:list` | 编辑综合订单 |
| `POST` | `/master-orders/:id/cancel` | `order-management:list` | 取消综合订单 |

---

## 财务管理 (finance) {#finance}

财务模块管理应收账款、应付账款与费用。路由组前缀 `/finance`。

### 应收账款

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/finance/receivables` | `finance:receivable:list` | 应收列表 |
| `GET` | `/finance/receivables/by-order/:orderId/:orderType` | 动态判断 | 按订单查应收 |
| `GET` | `/finance/receivables/:id` | `finance:receivable:list` | 应收详情 |
| `POST` | `/finance/receivables` | `finance:receivable:list` | 创建应收 |
| `PUT` | `/finance/receivables/:id` | `finance:receivable:list` | 更新应收 |
| `DELETE` | `/finance/receivables/:id` | `finance:receivable:list` | 删除应收 |
| `POST` | `/finance/receivables/:id/receive` | `finance:receivable:list` | 收款核销 |
| `GET` | `/finance/receivables/:id/payments` | `finance:receivable:list` | 收款记录 |
| `PUT` | `/finance/receivables/payments/:paymentId` | `finance:receivable:list` | 更新收款记录 |
| `GET` | `/finance/receivables/overdue` | `finance:receivable:list` | 逾期应收 |
| `GET` | `/finance/receivables/aging-stats` | `finance:receivable:list` | 账龄统计 |

### 应付账款 / 费用

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/finance/payables` | `finance:payable:list` | 应付列表 |
| `GET` | `/finance/payables/:id` | `finance:payable:list` | 应付详情 |
| `POST` | `/finance/payables` | `finance:payable:list` | 创建应付 |
| `PUT` | `/finance/payables/:id` | `finance:payable:list` | 更新应付 |
| `DELETE` | `/finance/payables/:id` | `finance:payable:list` | 删除应付 |
| `POST` | `/finance/payables/:id/pay` | `finance:payable:list` | 付款 |
| `GET` | `/finance/payables/:id/payments` | `finance:payable:list` | 付款记录 |
| `GET` | `/finance/payables/overdue` | `finance:payable:list` | 逾期应付 |
| `GET` | `/finance/expenses` | `finance:expense:list` | 费用列表 |
| `GET` | `/finance/expenses/stats` | `finance:expense:list` | 费用汇总统计 |
| `GET` | `/finance/expenses/:id` | `finance:expense:list` | 费用详情 |
| `POST` | `/finance/expenses` | `finance:expense:list` | 创建费用 |
| `PUT` | `/finance/expenses/:id` | `finance:expense:list` | 更新费用 |
| `DELETE` | `/finance/expenses/:id` | `finance:expense:list` | 删除费用 |
| `POST` | `/finance/expenses/:id/pay` | `finance:expense:list` | 费用付款 |
| `GET` | `/finance/expenses/:id/payments` | `finance:expense:list` | 费用付款记录 |
| `GET` | `/finance/expenses/delivery/:delivery_id` | `finance:expense:list` | 按交付查费用 |

---

## 数据看板 (dashboard) {#dashboard}

数据看板提供经营概览与各类统计图表数据。路由组前缀 `/dashboard`；基础看板需 `dashboard:base`，财务/明细类需 `dashboard:detail`。

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/dashboard/overview` | `dashboard:base` | 经营概览 |
| `GET` | `/dashboard/production-trend` | `dashboard:base` | 生产趋势 |
| `GET` | `/dashboard/mold-status` | `dashboard:base` | 模具状态分布 |
| `GET` | `/dashboard/order-ranking` | `dashboard:base` | 订单排名 |
| `GET` | `/dashboard/in-production-molds` | `dashboard:base` | 生产中模具 |
| `GET` | `/dashboard/in-progress-mold-orders` | `dashboard:base` | 进行中模具订单 |
| `GET` | `/dashboard/in-progress-production-orders` | `dashboard:base` | 进行中生产订单 |
| `GET` | `/dashboard/finance-overview` | `dashboard:detail` | 财务概览 |
| `GET` | `/dashboard/detail-overview` | `dashboard:detail` | 明细概览 |
| `GET` | `/dashboard/detail-production-trend` | `dashboard:detail` | 明细生产趋势 |
| `GET` | `/dashboard/delivery-punctuality` | `dashboard:detail` | 交付准时率 |

---

## 公共引用数据 (reference) {#reference}

公共引用数据接口用于各页面下拉/选择器数据，仅需 JWT 认证（无额外菜单权限），以避免跨模块 403。路由组前缀 `/reference`。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/reference/customers` | 客户下拉 |
| `GET` | `/reference/customers/:id` | 客户详情 |
| `GET` | `/reference/warehouses` | 仓库下拉 |
| `GET` | `/reference/processes` | 工序下拉 |
| `GET` | `/reference/suppliers` | 供应商下拉 |
| `GET` | `/reference/processors` | 加工商下拉 |
| `GET` | `/reference/process-templates` | 工序模板下拉 |
| `GET` | `/reference/process-templates/active` | 启用中工序模板 |
| `GET` | `/reference/dict-data` | 字典数据下拉 |
| `GET` | `/reference/dict-data-by-id` | 按 ID 查字典数据 |
| `GET` | `/reference/dict-types` | 字典类型下拉 |
| `GET` | `/reference/status-flow-configs` | 状态流转配置下拉 |
| `GET` | `/reference/status-flow-configs/:id` | 状态流转配置详情 |
| `GET` | `/reference/company` | 公司信息（打印等场景） |
| `GET` | `/reference/print-notice-config` | 打印通知单配置 |
| `GET` | `/reference/receiving-accounts` | 收款账户下拉 |
| `GET` | `/reference/receiving-accounts/:id` | 收款账户详情 |
| `GET` | `/reference/molds` | 模具档案下拉 |
| `GET` | `/reference/molds/:id` | 模具详情 |
| `GET` | `/reference/products` | 产品下拉 |
| `GET` | `/reference/products/:id` | 产品详情 |
| `GET` | `/reference/mold-product-relations/by-mold` | 按模具查关联 |
| `GET` | `/reference/mold-product-relations/by-product` | 按产品查关联 |

---

## 文件上传 (upload) {#upload}

文件上传接口不单独设权限，由前端页面权限间接控制。上传组前缀 `/upload`；文件下载接口挂载在根路径 `/files`（非 `/api`）。

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/upload/image` | 上传图片 |
| `POST` | `/upload/files` | 上传文件 |
| `POST` | `/upload/generate-thumbnails` | 补全缺失缩略图 |
| `GET` | `/files/:id/download` | 按文件 ID 下载（根路径，Content-Disposition 返回原始文件名） |

---

## 公开 / 实时接口 (public) {#public}

以下接口允许免登录或无需业务菜单权限访问，供外部加工商报工、健康检查、实时通知等场景使用。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/ping` | 连通性测试（返回 `pong`） |
| `GET` | `/api/ws` | WebSocket 实时通知（token 经查询参数传入，内部自行校验） |
| `GET` | `/api/public/outsourcing/:token` | 加工商凭分享令牌查看外发任务（免登录） |
| `POST` | `/api/public/outsourcing/:token/report` | 加工商免登录报工 |
| `POST` | `/api/public/outsourcing/:token/process/toggle` | 加工商免登录切换工序状态 |
| `GET` | `/health` | 健康检查（根路径，供负载均衡/监控） |
| `GET` | `/api/debug/metrics` | 性能监控指标（需 JWT） |
| `GET` | `/api/debug/pool` | 连接池状态（需 JWT） |
| `GET` | `/api/debug/health` | 完整健康检查（需 JWT） |
| `GET` | `/api/search` | 全局搜索（需 JWT，无独立权限） |

---

## 其他说明 {#notes}

1. **权限模型**：接口通过 `middleware.RequirePerm(perm)` 或 `RequireAnyPerm([]string{...})` 校验菜单权限。写操作大多以 `RequireAnyPerm` 同时放行 `:create`/`:update`/`:delete` 与 `:list`，即拥有列表权限的用户通常也能在列表页内联提交写操作。
2. **路径参数**：Gin 框架以 `:` 声明路径参数（如 `/mold/:id`），实际请求需替换为具体值（如 `/mold/12`）。
3. **外发公开链路**：`/api/public/outsourcing/:token/*` 供加工商免登录使用，`token` 由 `POST /production/outsourcing/:id/share-token` 生成，可经 `regenerate-token` 重新生成。
4. **响应格式**：接口统一返回 JSON；具体响应体结构以代码中 controller/handler 实现为准（本文档聚焦路由与用途，未逐接口罗列请求/响应字段）。
5. **字典与引用数据**：前端通常先调用 `/reference/*` 或 `/system/dict-data` 拉取下拉选项，再提交业务表单；字典取值与中文标签详见《术语对照表》。
