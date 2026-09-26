import { h, defineComponent as vueDefineComponent } from 'vue'
import type {
  VNode,
  Ref,
  ClassValue,
  StyleValue,
  EmitsOptions,
  SlotsType,
  SetupContext,
  RenderFunction,
  ComponentOptions,
  ComponentObjectPropsOptions,
  DefineSetupFnComponent
} from 'vue'

import { createVanity, type VanityH, type ElementBuilder } from './index.ts'

type HtmlTags = {
  [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K]
}

type VueBaseProps = {
  class?: ClassValue
  style?: StyleValue
  key?: string | number
  ref?: Ref<any> | string
}

type VueElements = {
  [K in keyof HtmlTags]: Omit<HtmlTags[K], 'style'> & VueBaseProps
}

export type VueComponentWithProps<Props = {}> = ElementBuilder<
  Props & VueBaseProps,
  VNode,
  string | number | boolean | VNode | null | undefined
>

export type EmitsToProps<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (...args: Parameters<T[K]>) => any
}

export type VueVanityH = VanityH<
  VNode,
  string | number | boolean | VNode | null | undefined,
  VueElements
>

export type ExtractVueProps<T> = T extends abstract new (...args: any[]) => { $props: infer P }
  ? P
  : {}

/** 该适配器在 `Object.prototype` 上注册的属性名 */
export const KEY = '$vue'

export const vanity = createVanity(h, { key: KEY }) as unknown as VueVanityH

declare global {
  interface VanityKeys {
    /**
     * 值为 `any`：这是被消费的位置（`obj.$vue` 直接链式调用），
     * 写成具体 builder 类型会让 `name` 与函数内置的 `Function.name` 撞车。
     * 精确类型由 `defineComponent` 的返回值提供。
     */
    [KEY]: any
  }
}

type WithDollar<R, E extends EmitsOptions> = R & {
  [KEY]: VueComponentWithProps<
    E extends Record<string, (...args: any[]) => any>
      ? Omit<ExtractVueProps<R>, `on${string}`> & EmitsToProps<E>
      : ExtractVueProps<R>
  >
}

export function defineComponent<
  Props extends Record<string, any>,
  E extends EmitsOptions = {},
  EE extends string = string,
  S extends SlotsType = {}
>(
  setup: (props: Props, ctx: SetupContext<E, S>) => RenderFunction | Promise<RenderFunction>,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
    props?: (keyof Props)[] | ComponentObjectPropsOptions<Props>
    emits?: E | EE[]
    slots?: S
  }
): WithDollar<DefineSetupFnComponent<Props, E, S>, E> {
  return vueDefineComponent(setup as any, options as any) as any
}
