import { h } from 'preact'
import type { ComponentChild, JSX, Ref, Key, CSSProperties } from 'preact'

import {
  createVanity,
  type VanityH,
  type ElementBuilder,
  type ExtractComponentProps
} from './index.ts'

type WithPreactProps<P> = P & {
  class?: string
  style?: string | CSSProperties
  key?: Key
  ref?: Ref<never>
}

export type PreactElementBuilder<P> = ElementBuilder<
  WithPreactProps<P>,
  JSX.Element,
  ComponentChild
>

export type PreactVanityH = VanityH<JSX.Element, ComponentChild, JSX.IntrinsicElements>

/** 该适配器在 `Object.prototype` 上注册的属性名 */
export const KEY = '$preact'

export const vanity = createVanity(h, { key: KEY }) as unknown as PreactVanityH

declare global {
  interface VanityKeys {
    /**
     * 值为 `any`：这是被消费的位置（`obj.$preact` 直接链式调用），
     * 写成具体 builder 类型会让 `name` 与函数内置的 `Function.name` 撞车。
     * 精确类型由各 `defineComponent` 的返回值提供。
     */
    [KEY]: any
  }
}

export function defineComponent<T extends (props: any) => JSX.Element>(
  component: T
): T & { [KEY]: PreactElementBuilder<ExtractComponentProps<T>> } {
  return component as any
}
