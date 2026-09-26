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
    [KEY]: ReactElementBuilder<any>
  }
}

export function defineComponent<T extends (props: any) => JSX.Element>(
  component: T
): T & { [KEY]: ReactElementBuilder<ExtractComponentProps<T>> } {
  return component as any
}
