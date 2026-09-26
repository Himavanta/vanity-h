export type ExtractComponentProps<T> = T extends (props: infer P) => any ? P : {}

type UniversalChild = unknown

export type ElementBuilder<Props, VNode, Child = UniversalChild> = ((
  ...children: Child[]
) => VNode) & {
  [K in keyof Props]-?: (value: Props[K]) => ElementBuilder<Props, VNode, Child>
}

export type VanityH<
  VNode,
  Child = UniversalChild,
  HtmlElements = Record<string, Record<string, any>>
> = {
  [Tag in keyof HtmlElements]: ElementBuilder<HtmlElements[Tag], VNode, Child>
}

export interface VanityOptions {
  /** 挂载到 `Object.prototype` 上的属性名，用于链式包装组件。默认 `'$'` */
  key?: string
}

/**
 * 组件包装入口的注册表。
 *
 * 各框架适配器（`vanity-h/preact` 等）会在自己的模块里向此处添加对应的
 * key，从而让任意对象上的 `obj.key` 获得精确类型；`Object` 继承它，
 * 所以只需声明一次即可作用于所有对象。
 */
declare global {
  interface VanityKeys {
    /** 默认 key，未显式指定 `options.key` 时使用 */
    $: any
  }
  interface Object extends VanityKeys {}
}

export default createVanity
export function createVanity<
  H extends (tag: any, props: any, ...children: any[]) => any,
  VNode = ReturnType<H>
>(h: H, { key = '$' }: VanityOptions = {}): VanityH<VNode> {
  const createProxy = (tag: any, props: Record<string, any> = {}): ElementBuilder<any, VNode> => {
    const fn = (...children: any[]) => h(tag, { ...props }, ...children.flat(Infinity))
    return new Proxy(fn as any, {
      get: (_, prop: string) => (value?: any) => createProxy(tag, { ...props, [prop]: value })
    })
  }

  Object.defineProperty(Object.prototype, key, {
    get() {
      return createProxy(this.valueOf())
    },
    configurable: true
  })

  return new Proxy({} as any, {
    get: (_, tag: string) => createProxy(tag)
  }) as VanityH<VNode>
}
