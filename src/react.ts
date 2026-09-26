import { createElement } from 'react'
import type { ReactNode, JSX, Ref, Key, CSSProperties } from 'react'

import {
  createVanity,
  type VanityH,
  type ElementBuilder,
  type ExtractComponentProps
} from './index.ts'

type WithReactProps<P> = P & {
  className?: string
  style?: CSSProperties
  key?: Key
  ref?: Ref<never>
}

export type ReactElementBuilder<P> = ElementBuilder<WithReactProps<P>, JSX.Element, ReactNode>

export type ReactVanityH = VanityH<JSX.Element, ReactNode, JSX.IntrinsicElements>

/** 该适配器在 `Object.prototype` 上注册的属性名 */
export const KEY = '$react'

const vanity = createVanity(createElement, { key: KEY }) as unknown as ReactVanityH
export default vanity

declare global {
  interface VanityKeys {
    /**
     * 值为 `any`：这是被消费的位置（`obj.$react` 直接链式调用），
     * 写成具体 builder 类型会让 `name` 与函数内置的 `Function.name` 撞车。
     * 精确类型由各 `defineComponent` 的返回值提供。
     */
    [KEY]: any
  }
}

export function defineComponent<T extends (props: any) => JSX.Element>(
  component: T
): T & { [KEY]: ReactElementBuilder<ExtractComponentProps<T>> } {
  return component as any
}
