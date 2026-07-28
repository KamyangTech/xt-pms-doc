<script setup>
import { ref, onMounted } from 'vue'
import ErrorsTable from './ErrorsTable.vue'

const highlight = ref()
onMounted(() => {
  highlight.value = location.hash.slice(1)
})

// 项目真实业务错误码（定义于 server/internal/common/response/response.go）
const businessErrors = {
  '200': '请求成功（SUCCESS）',
  '400': '参数错误 / 请求格式有误（BAD_REQUEST）',
  '401': '未登录 / Token 无效 / 登录过期（UNAUTHORIZED）',
  '403': '无权限访问（FORBIDDEN）',
  '404': '请求的资源不存在（NOT_FOUND）',
  '500': '服务器内部错误（ERROR）',
}

// HTTP 状态码 — 中间件可能直接返回
const httpStatusErrors = {
  '429': '请求频率超限（限流中间件）',
  '413': '请求体超限（上限 10MB）',
  '204': '无内容（CORS 预检请求）',
  '507': '存储空间不足',
}

// 常见错误对照
const commonErrors = {
  '400-无效参数': '缺少必填字段或参数格式错误 → 检查前端提交参数与后端模型',
  '400-JSON解析失败': '请求体 JSON 不合法',
  '401-未提供认证': '请求头未携带 Authorization token',
  '401-Token过期': 'Token 超时或被篡改 → 重新登录',
  '403-无权限': '当前角色无权操作该资源 → 检查角色权限配置',
  '404-资源不存在': '路由不存在或 ID 无效',
  '500-服务器错误': '根据环境：开发模式查看原始信息，生产模式 message 已脱敏 → 查看后端日志',
  '429-限流': '请求过于频繁，降低请求频率',
  '连接拒绝': '后端不可达 → 检查服务是否启动',
  '请求超时': '网络超时 → 检查网络连接',
}
</script>

# 错误代码参考 {#error-reference}

> 本文档记录了 XT-PMS 项目中前后端统一的错误码体系。数据来源于 `server/internal/common/response/response.go`（业务码定义）、`server/internal/common/middleware/`（HTTP 限流/限体等）及 `web/src/utils/request/index.ts`（前端处理逻辑）。

## 一、统一响应格式

所有后端 API 返回 JSON：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 业务状态码 |
| `message` | string | 提示信息（生产环境自动脱敏） |
| `data` | any | 成功时承载业务数据 |

## 二、业务状态码

<ErrorsTable kind="business" :errors="businessErrors" :highlight="highlight" />

## 三、HTTP 状态码

<ErrorsTable kind="http" :errors="httpStatusErrors" :highlight="highlight" />

## 四、常见错误对照

<ErrorsTable kind="common" :errors="commonErrors" :highlight="highlight" />

---

## 附录：前端处理逻辑

错误处理位于 `web/src/utils/request/index.ts`：

- **`code === 200`** → 成功，返回 `data`
- **`code` 非 200** → `请求接口错误, 错误码: ${code}`
- **HTTP 401** → `登录已过期，请重新登录` → 清除 Token，跳转 `/login`
- **HTTP 403** → `无权限访问` → 跳转 `/no-permission`
- **HTTP 404** → `请求的资源不存在`（仅提示，不跳转）
- **HTTP 500** → 取后端 `message`（已脱敏），生产模式跳转 `/server-error`
- **网络错误（连接拒绝）** → `服务器连接失败` → 生产模式跳转 `/server-error`
- **网络错误（超时）** → `网络请求超时，请检查网络连接后重试`

## 附录：错误消息脱敏规则

生产环境下，`response.Error()` 返回的 `message` 中若包含以下关键词，自动替换为 `服务器内部错误，请稍后重试`：

- `sqlstate` / `sql error` / `db error`
- `panic` / `stack trace` / `goroutine` / `.go:` / `.sql:`
- `connection refused` / `no such host`

开发模式（`dev` / `test`）不做脱敏，保留完整错误信息。
