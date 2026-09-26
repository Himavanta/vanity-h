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

declare global {
  interface Object {
    /** 默认 key 下的组件包装入口，对应 `createVanity(h)` 未传 `options.key` 时的行为 */
    $: any
  }
}
