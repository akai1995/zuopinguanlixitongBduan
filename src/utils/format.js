/**
 * 通用数据格式化工具
 * 严格遵循规范文档的格式要求
 */

/**
 * 格式化日期时间：YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

/**
 * 格式化日期：YYYY-MM-DD
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${Y}-${M}-${D}`
}

/**
 * 格式化时间：HH:mm:ss
 */
export function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * 格式化金额：千分位分隔 + 货币符号
 */
export function formatMoney(value) {
  if (value == null) return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 格式化百分比：保留小数点后2位
 */
export function formatPercent(value) {
  if (value == null) return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  return `${(num * 100).toFixed(2)}%`
}

/**
 * 格式化文件大小：自动转换为 KB/MB/GB
 */
export function formatFileSize(bytes) {
  if (bytes == null || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

/**
 * 生成唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 截断文本
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}