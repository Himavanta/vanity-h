import { rox } from 'roxcss'

import { createVanity, type ElementBuilder } from './index.ts'

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

type VanityProps = Record<string, unknown> & {
  className?: string
  class?: string
  rox?: string
  /** 显式声明：否则索引签名不会覆盖函数内置的 `Function.name`，导致 `$.name(...)` 不可调用 */
  name?: string
}
type ComponentFn = (props: Record<string, unknown>) => Node

// 声明 `$` 的类型：运行时由下方 createVanity 注册，类型需要在这里显式补上
declare global {
  interface VanityKeys {
    $: ElementBuilder<VanityProps, Node, Node>
  }
}

export const vanity = createVanity(
  (tag: string | ComponentFn, propsAlias: VanityProps, ...children: Node[]) => {
    if (typeof tag === 'function') return tag({ ...propsAlias, children })

    const { class: classAlias, rox: roxAlias, ...props } = propsAlias

    const className = [props.className, classAlias, roxAlias && rox`${roxAlias}`]
      .filter(Boolean)
      .join(' ')

    if (className) props.className = className

    const el = Object.assign(document.createElement(tag), props)
    for (const item of children) el.append(item)
    return el
  },
  { key: '$' }
)

export const css = (raw: TemplateStringsArray, ...values: any[]) =>
  vanity.style(String.raw({ raw }, ...values))
