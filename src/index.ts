export type ExtractComponentProps<T> = T extends (props: infer P) => unknown ? P : {}

type UniversalChild = unknown

export type ElementBuilder<Props, VNode, Child = UniversalChild> = ((
  ...children: Child[]
) => VNode) & {
  [K in keyof Props]-?: (value: Props[K]) => ElementBuilder<Props, VNode, Child>
}

export type VanityH<
  VNode,
  Child = UniversalChild,
  HtmlElements = Record<string, Record<string, unknown>>
> = {
  [Tag in keyof HtmlElements]: ElementBuilder<HtmlElements[Tag], VNode, Child>
}

export interface VanityOptions {
  /**
   * 挂载到 `Object.prototype` 上的属性名，用于链式包装组件。
   *
   * 只有显式传入时才会注册；不传则不注册，`obj.key` 也不可用。
   * 之所以不提供默认值，是为了避免「类型声明与实际注册的 key 不一致」。
   */
  key?: string
}

/**
 * 组件包装入口的注册表。
 *
 * 各框架适配器（`vanity-h/preact` 等）会在自己的模块里向此处添加对应的
 * key，从而让任意对象上的 `obj.key` 获得类型；`Object` 继承它，
 * 所以只需声明一次即可作用于所有对象。
 *
 * 注意：接口本身不声明任何 key。key 的类型必须由**实际挂载它的模块**声明，
 * 否则会出现「类型说存在、运行时为 `undefined`」的不一致。
 */
declare global {
  interface VanityKeys {}
  interface Object extends VanityKeys {}
}

export default createVanity
// 注：约束的参数位置必须用 `any`（函数参数逆变），改成 `unknown`
// 会导致 preact/vue 等渲染器的 `h` 无法满足该约束。
export function createVanity<
  H extends (tag: any, props: any, ...children: any[]) => any,
  VNode = ReturnType<H>
>(h: H, { key }: VanityOptions = {}): VanityH<VNode> {
  const createProxy = (tag: any, props: Record<string, any> = {}): ElementBuilder<any, VNode> => {
    const fn = (...children: any[]) => h(tag, { ...props }, ...children.flat(Infinity))
    return new Proxy(fn as any, {
      get: (_, prop: string) => (value?: any) => createProxy(tag, { ...props, [prop]: value })
    })
  }

  if (key) {
    Object.defineProperty(Object.prototype, key, {
      get() {
        return createProxy(this.valueOf())
      },
      configurable: true
    })
  }

  return new Proxy({} as any, {
    get: (_, tag: string) => createProxy(tag)
  }) as VanityH<VNode>
}
