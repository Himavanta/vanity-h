import { createVanity, type VanityH } from './index.ts'

type InsertMode = 'prepend' | 'append' | 'before' | 'after'
type InsertOptions = { signal?: AbortSignal }
export type InsertFn = (selector: string, el: Node, options?: InsertOptions) => Promise<void>

/** 目标存在则立即插入并返回 true,否则不做任何事返回 false */
const insertOnce = (selector: string, el: Node, mode: InsertMode): boolean => {
  const target = document.querySelector<HTMLElement>(selector)
  if (!target) return false
  target[mode](el)
  return true
}

const abortError = (selector: string) =>
  new DOMException(`等待 "${selector}" 出现时操作被中止`, 'AbortError')

/**
 * 生成插入函数。
 *
 * 目标存在则立即插入；否则等待其出现后再插入。
 * 传入 `signal` 可中止等待，此时返回的 Promise 以 `AbortError` 拒绝。
 */
const createInsert = (mode: InsertMode): InsertFn =>
  (selector, el, options) => {
    const { signal } = options ?? {}

    if (signal?.aborted) return Promise.reject(abortError(selector))
    if (insertOnce(selector, el, mode)) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (insertOnce(selector, el, mode)) {
          observer.disconnect()
          signal?.removeEventListener('abort', onAbort)
          resolve()
        }
      })
      const onAbort = () => {
        observer.disconnect()
        reject(abortError(selector))
      }

      signal?.addEventListener('abort', onAbort, { once: true })
      observer.observe(document.documentElement, { childList: true, subtree: true })
    })
  }

/** 插入到目标内部末尾 */
export const append = createInsert('append')
/** 插入到目标内部开头 */
export const prepend = createInsert('prepend')
/** 插入到目标之前（同级） */
export const before = createInsert('before')
/** 插入到目标之后（同级） */
export const after = createInsert('after')

export type VanityProps = Record<string, unknown> & {
  /** 显式声明：否则索引签名不会覆盖函数内置的 `Function.name`，导致 `$.name(...)` 不可调用 */
  name?: string
}
type ComponentFn = (props: Record<string, unknown>) => Element
type H = (tag: string | ComponentFn, props: VanityProps, ...children: Node[]) => Element

export interface DomVanityOptions {
  /**
   * 注册到 `Object.prototype` 上的属性名。
   *
   * 只有显式传入时才会注册；不传则不注册，`obj.key` 也不可用。
   * 与 `createVanity` 一致，不提供默认值，避免「类型声明与实际注册的 key 不一致」。
   */
  key?: string
}

/** DOM 渲染器实例 */
export interface DomVanity {
  vanity: VanityH<Element, unknown, Record<string, VanityProps>>
  css: (raw: TemplateStringsArray, ...values: unknown[]) => Element
}

/**
 * 创建 DOM 渲染器实例。
 *
 * 注意：注册到 `Object.prototype` 的 key 未自带类型声明。
 * 使用方需自行补充，例如：
 *
 * ```ts
 * declare global {
 *   interface VanityKeys {
 *     $: ElementBuilder<VanityProps, Element, Node>
 *   }
 * }
 * ```
 */
export function createDomVanity({ key }: DomVanityOptions = {}): DomVanity {
  const h: H = (tag, props, ...children) => {
    if (typeof tag === 'function') return tag({ ...props, children })

    const el = Object.assign(document.createElement(tag), props)
    for (const item of children) el.append(item)
    return el
  }

  const vanity = createVanity(h, { key }) as unknown as VanityH<
    Element,
    unknown,
    Record<string, VanityProps>
  >

  const css = (raw: TemplateStringsArray, ...values: unknown[]) =>
    vanity.style(String.raw({ raw }, ...values))

  return { vanity, css }
}
