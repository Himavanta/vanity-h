import { rox as defaultRox, type RoxInstance } from 'roxcss'

import { createVanity, type VanityH } from './index.ts'

const INSERT_MODES = ['prepend', 'append', 'before', 'after'] as const
type InsertMode = (typeof INSERT_MODES)[number]
type InsertOptions = { signal?: AbortSignal }
type InsertFn = (this: string, el: Node, options?: InsertOptions) => Promise<void>

declare global {
  interface String {
    prepend: InsertFn
    append: InsertFn
    before: InsertFn
    after: InsertFn
  }
}

/** 目标存在则立即插入并返回 true,否则不做任何事返回 false */
const insertOnce = (selector: string, el: Node, mode: InsertMode): boolean => {
  const target = document.querySelector<HTMLElement>(selector)
  if (!target) return false
  target[mode](el)
  return true
}

const abortError = (selector: string) =>
  new DOMException(`等待 "${selector}" 出现时操作被中止`, 'AbortError')

Object.assign(
  String.prototype,
  Object.fromEntries(
    INSERT_MODES.map((mode) => [
      mode,
      function (this: string, el: Node, options?: InsertOptions) {
        const selector = this.valueOf()
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
      } as InsertFn
    ])
  )
)

export type VanityProps = Record<string, unknown> & {
  className?: string
  class?: string
  rox?: string
  /** 显式声明：否则索引签名不会覆盖函数内置的 `Function.name`，导致 `$.name(...)` 不可调用 */
  name?: string
}
type ComponentFn = (props: Record<string, unknown>) => Element
type H = (tag: string | ComponentFn, props: VanityProps, ...children: Node[]) => Element

export interface DomVanityOptions {
  /** 解析 `rox` 属性的 roxcss 实例；默认使用 roxcss 的默认预设 */
  rox?: RoxInstance
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
 * 传入自定义的 roxcss 实例即可扩展 `rox` 属性的工具类词汇
 * （例如为 CSS 变量、自有原子类注册 matcher）。
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
export function createDomVanity({ rox = defaultRox, key }: DomVanityOptions = {}): DomVanity {
  const h: H = (tag, propsAlias, ...children) => {
    if (typeof tag === 'function') return tag({ ...propsAlias, children })

    const { class: classAlias, rox: roxAlias, ...props } = propsAlias

    const className = [props.className, classAlias, roxAlias && rox`${roxAlias}`]
      .filter(Boolean)
      .join(' ')

    if (className) props.className = className

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
