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

const vanity = createVanity(createElement) as unknown as ReactVanityH
export default vanity

export function defineComponent<T extends (props: any) => JSX.Element>(
  component: T
): T & { $: ReactElementBuilder<ExtractComponentProps<T>> } {
  return component as any
}
