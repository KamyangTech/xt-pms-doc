import type MarkdownIt from 'markdown-it'

/**
 * 判断表格是否是 API 接口表格（表头包含"方法"和"路径"列）
 */
function isApiTable(lines: string[]): boolean {
  const headerLine = lines[0]
  if (!headerLine) return false
  return headerLine.includes('方法') && headerLine.includes('路径')
}

/**
 * 解析 API 表格，返回 ApiEndpoint 组件列表
 * 支持 3 列（方法|路径|说明）和 4 列（方法|路径|权限|说明）两种格式
 */
function parseApiTable(lines: string[]): string {
  if (lines.length < 3) return ''

  const headerLine = lines[0] // | 方法 | 路径 | 权限 | 说明 |
  const hasPermColumn = headerLine.includes('权限')

  // 找到分隔行，之后是数据行
  let dataStartIdx = 1
  while (dataStartIdx < lines.length && lines[dataStartIdx].includes('---')) {
    dataStartIdx++
  }

  let dataEndIdx = dataStartIdx
  while (
    dataEndIdx < lines.length &&
    lines[dataEndIdx].trim().startsWith('|') &&
    !lines[dataEndIdx].includes('---')
  ) {
    dataEndIdx++
  }

  const dataLines = lines.slice(dataStartIdx, dataEndIdx)
  if (dataLines.length === 0) return ''

  const result: string[] = []

  for (const row of dataLines) {
    // 解析: | `GET` | `/system/profile` | 登录即可 | 获取当前用户信息 |
    const cells = row
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)

    if (cells.length < (hasPermColumn ? 4 : 3)) continue

    const method = cells[0].replace(/`/g, '').trim()
    const path = cells[1].replace(/`/g, '').trim()

    let perm = ''
    let desc = ''

    if (hasPermColumn) {
      perm = cells[2].replace(/`/g, '').trim()
      desc = cells.length > 3 ? cells.slice(3).join(' ').trim() : ''
    } else {
      desc = cells.length > 2 ? cells.slice(2).join(' ').trim() : ''
    }

    const permAttr = perm ? ` perm="${escapeAttr(perm)}"` : ''
    result.push(
      `<ApiEndpoint method="${method}" path="${escapeAttr(path)}"${permAttr}>${desc}</ApiEndpoint>`
    )
  }

  return result.join('\n')
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/\n/g, ' ')
}

/**
 * 将 markdown 中的 API 表格替换为 ApiEndpoint 组件
 */
function transformApiTables(md: string): string {
  const lines = md.split('\n')
  const output: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // 检测表格起始行（以 | 方法 | 开头且上一行是空行或文本）
    if (trimmed.startsWith('|') && trimmed.includes('方法') && trimmed.includes('路径')) {
      // 收集整个表格
      const tableLines: string[] = [trimmed]
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j]
        if (next.trim().startsWith('|') && !next.includes('---') && next.includes('|')) {
          tableLines.push(next)
          j++
        } else if (next.trim().startsWith('|') && next.includes('---')) {
          tableLines.push(next)
          j++
        } else {
          break
        }
      }

      if (isApiTable(tableLines)) {
        const components = parseApiTable(tableLines)
        if (components) {
          output.push(components)
          i = j
          // 跳过可能的空行
          while (i < lines.length && lines[i].trim() === '') {
            i++
          }
          // 如果下一行不是表格，输出空行分隔
          if (
            i < lines.length &&
            !(
              lines[i].trim().startsWith('|') &&
              lines[i].trim().includes('方法')
            )
          ) {
            output.push('')
          }
          continue
        }
      }
    }

    output.push(line)
    i++
  }

  return output.join('\n')
}

/**
 * VitePress markdown-it 插件
 * 自动将 API 接口表格转换为卡片式 ApiEndpoint 组件
 */
export function apiTablePlugin(md: MarkdownIt): void {
  const defaultRender = md.render.bind(md)

  md.render = function (src: string, env?: any): string {
    const transformed = transformApiTables(src)
    return defaultRender(transformed, env)
  }
}

export default apiTablePlugin
