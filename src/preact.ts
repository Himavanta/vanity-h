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

const vanity = createVanity(h, { key: KEY }) as unknown as PreactVanityH
export default vanity

declare global {
  interface VanityKeys {
    [KEY]: PreactElementBuilder<any>
  }
}

export function defineComponent<T extends (props: any) => JSX.Element>(
  component: T
): T & { [KEY]: PreactElementBuilder<ExtractComponentProps<T>> } {
  return component as any
}
