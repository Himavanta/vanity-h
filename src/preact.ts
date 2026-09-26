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

const vanity = createVanity(h) as unknown as PreactVanityH
export default vanity

export function defineComponent<T extends (props: any) => JSX.Element>(
  component: T
): T & { $: PreactElementBuilder<ExtractComponentProps<T>> } {
  return component as any
}
