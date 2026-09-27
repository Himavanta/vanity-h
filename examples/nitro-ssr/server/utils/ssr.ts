import { createVanity, type ElementBuilder, type VanityH } from 'vanity-h'

/**
 * 无 JSX 的字符串 SSR 渲染库。
 *
 * 基于 `vanity-h` 的链式语法（`div.class('a')('text')`），把节点树直接序列化成
 * HTML 字符串，用于在服务端拼接页面。与业务无关，可独立复用。
 */

/** 空格分隔字符串 → Set，用于元素/属性查找表 */
export const splitSet = (str: string): Set<string> => new Set(str.trim().split(/\s+/))

const VOID_ELEMENTS = splitSet(
  'area base br col embed hr img input link meta param source track wbr'
)

/** 组件返回一段 HTML 字符串，与普通字符串子节点同等对待 */
export type ComponentFn = (props: Record<string, unknown>) => string

// ── 序列化 ────────────────────────────────────────────

const isNotNil = (val: unknown): boolean => val != null

/** 转义属性值，避免破坏外层引号 */
const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 子节点 → HTML 字符串：字符串原样输出，数组递归，空值/布尔值忽略 */
const serializeSSRNode = (child: unknown): string => {
  if (!isNotNil(child) || typeof child === 'boolean') return ''
  if (Array.isArray(child)) return child.map(serializeSSRNode).join('')
  return String(child)
}

/**
 * 客户端运行时：为 `<script>` 内的函数提供统一的执行入口，随页面注入一次。
 *
 * `r(script, fn)` 在同步阶段执行 `fn` 并传入当前脚本元素；用 `finally`
 * 保证无论是否抛异常都移除脚本，且错误继续向外抛出、不被吞掉。
 */
export const CLIENT_RUNTIME = `globalThis.v={r(c,f){try{f?.(c)}finally{c?.remove()}}};v.r(document.currentScript)`

/**
 * 函数 → 运行时调用源码。
 *
 * `document.currentScript` 在同步执行瞬间传入，因此函数内部
 * （包括 `await` 之后）都能拿到脚本元素。
 */
const toScriptCall = (fn: Function): string => `v.r(document.currentScript,${fn.toString()})`

/** 序列化 `<script>` 的子节点：函数转为运行时调用，其余按普通节点处理 */
const serializeScriptChild = (child: unknown): string => {
  if (typeof child === 'function') return toScriptCall(child)
  return serializeSSRNode(child)
}

export type H = (
  tag: string | ComponentFn,
  props: Record<string, unknown>,
  ...children: any[]
) => string

// ── 渲染器 ────────────────────────────────────────────

const h: H = (tag, props, ...children) => {
  if (typeof tag === 'function') return tag({ ...props, children })

  let attrs = ''
  for (const [key, val] of Object.entries(props)) {
    if (val === true) {
      attrs += ` ${key}`
    } else if (val !== false && isNotNil(val)) {
      attrs += ` ${key}="${escapeAttr(String(val))}"`
    }
  }

  if (VOID_ELEMENTS.has(tag)) return `<${tag}${attrs} />`

  if (tag === 'script') {
    let body = ''
    for (const child of children) {
      body += serializeScriptChild(child)
    }
    return `<${tag}${attrs}>${body}</${tag}>`
  }

  let html = `<${tag}${attrs}>`
  for (const child of children) {
    html += serializeSSRNode(child)
  }
  html += `</${tag}>`
  return html
}

// 声明 `$` 的类型：运行时由下方 createVanity 注册，类型需要在这里显式补上
declare global {
  interface VanityKeys {
    $: ElementBuilder<Record<string, unknown>, string>
  }
}

export const vanity: VanityH<string> = createVanity<H>(h, { key: '$' })

/** `css\`...\`` → `<style>` 节点 */
export const css = (raw: TemplateStringsArray, ...values: any[]) =>
  vanity.style(String.raw({ raw }, ...values))
