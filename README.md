# vanity-h

Hyperscript without the nesting — chainable syntax that reads the way the DOM looks.  
告别嵌套的 hyperscript —— 链式语法，读起来和 DOM 的结构一样直观。

---

Hyperscript is a capable way to build UI without a compiler. The nested `h()` calls are another story. vanity-h turns them into a chainable syntax that reads the way the DOM looks — flat, ordered, and obvious.

No JSX, no templates, no build step. Just functions that compose.

Hyperscript 是不依赖编译器构建 UI 的强大方式。但嵌套的 `h()` 调用是另一回事。vanity-h 将它们变成可链式调用的语法，读起来和 DOM 的结构一样——扁平、有序、一目了然。

没有 JSX，没有模板，没有构建步骤。只有组合的函数。

---

## The Problem / 问题

```js
// Traditional hyperscript — the structure is buried in nesting
// 传统 hyperscript —— 结构被埋没在嵌套中
h('div', { class: 'card' }, [
  h('header', { class: 'card-header' }, [
    h('h2', null, 'Title'),
    h('button', { class: 'close', onClick: handleClose }, '×')
  ]),
  h('main', { class: 'card-body' }, [
    h('p', null, 'Content goes here')
  ])
])
```

Every layer adds indentation. Attributes, events, and children interleave. The visual shape of the code has little to do with the shape of the DOM.

每一层都增加缩进。属性、事件和子节点混杂在一起。代码的视觉形态与 DOM 的结构几乎没有关联。

---

## The vanity-h Way / vanity-h 的方式

```js
div.class('card')(
  header.class('card-header')(
    h2('Title'),
    button.class('close').onClick(handleClose)('×')
  ),
  main.class('card-body')(
    p('Content goes here')
  )
)
```

The structure matches what you see in the browser. The outer element wraps its children. Attributes chain before the final call. No arrays, no commas between siblings, no closing brackets fighting for attention.

结构与你浏览器中看到的一致。外层元素包裹其子节点。属性在最终调用前链式设置。没有数组，没有同级元素之间的逗号，没有争抢注意力的括号。

---

## How It Works / 原理

vanity-h is a thin wrapper around any hyperscript function. It gives you a set of proxy-based tag functions. Each tag function collects attributes through chained calls, then renders when invoked as a function with children.

vanity-h 是任意 hyperscript 函数的薄包装。它提供了一组基于 Proxy 的标签函数。每个标签函数通过链式调用收集属性，在被作为函数调用并传入子节点时渲染。

```js
button.class('btn').onClick(handle)('Click me')
//  config  →  config  →  config   →  render
//  配置 → 配置 → 配置 → 渲染
```

The chained calls return new proxies. The original is never mutated. You can reuse a configured element without affecting other uses.

链式调用返回新的 Proxy。原始对象永远不会被修改。你可以复用已配置的元素，而不影响其他使用处。

```js
const baseBtn = button.class('btn')

const redBtn = baseBtn.style('color: red')('Red')
const blueBtn = baseBtn.style('color: blue')('Blue')
// baseBtn remains unchanged / baseBtn 保持不变
```

---

## Quick Start / 快速开始

### NPM

```bash
npm install vanity-h
```

```js
import { h, render } from 'preact'
import { createVanity } from 'vanity-h'

const { div, span, button } = createVanity(h)

function App() {
  const [count, setCount] = useState(0)

  return div.class('app')(
    span('Count: ', count),
    button.onClick(() => setCount((c) => c + 1))('+1')
  )
}

render(App(), document.getElementById('app'))
```

### CDN

No build step required. Import directly in the browser.

无需构建步骤。直接在浏览器中导入。

```html
<script type="module">
  import { h, render } from 'https://esm.sh/preact'
  import { createVanity } from 'https://esm.sh/vanity-h'

  const { div, span } = createVanity(h)

  const app = () => div.class('app')(span('Hello World'))
  render(app(), document.getElementById('app'))
</script>
```

Works with any hyperscript renderer — Preact, React, Vue, Snabbdom, or your own.

与任何 hyperscript 渲染器配合使用——Preact、React、Vue、Snabbdom，或你自己的渲染器。

---

## Usage / 使用方式

```js
import { h } from 'your-renderer'
import { createVanity } from 'vanity-h'

const { div, h1, p, a, img, input, button } = createVanity(h)
```

**Tags / 标签**

- Any HTML element. The functions are created lazily, so you only pay for what you use.
- 任意 HTML 元素。函数是惰性创建的，只有你用到的才会生成。

**Attributes / 属性**

- Chain them. `class`, `style`, `id`, `href`, `src`, `disabled`, `placeholder`, `type`, and any custom attribute.
- 链式设置。`class`、`style`、`id`、`href`、`src`、`disabled`、`placeholder`、`type`，以及任何自定义属性。

**Events / 事件**

- `onClick`, `onInput`, `onSubmit`, or any `onXxx` handler.
- `onClick`、`onInput`、`onSubmit`，或任意 `onXxx` 处理器。

**Children / 子节点**

- Pass them as arguments to the final call. Strings, numbers, other elements, arrays — anything your hyperscript function accepts. Arrays are flattened automatically.
- 在最终调用中作为参数传入。字符串、数字、其他元素、数组——任意你的 hyperscript 函数接受的内容。数组会自动打平。

```js
// Attribute chaining / 属性链式调用
div.class('container').id('main').style('padding: 1rem')()

// Void elements — no children / Void 元素 —— 无子节点
input.type('text').placeholder('Enter name')()
br()
hr()

// Mix of children types / 混合子节点类型
div(
  h1('Welcome'),
  p('This is a ', a.href('/about')('link')),
  ['a', 'b', 'c'].map((s) => span(s))
)
```

---

## Wrapping Components / 包装组件

Pass a `key` to `createVanity(h, { key })` and every object gains a property under that name. Reading `anyObject.key` returns a builder bound to that object, so any function that accepts props can be rendered like an element:

向 `createVanity(h, { key })` 传入 `key` 后，每个对象都会获得一个以该名字命名的属性。读取 `anyObject.key` 会返回绑定到该对象的 builder，于是任何接受 props 的函数都能像元素一样渲染：

```js
import { h } from 'your-renderer'
import { createVanity } from 'vanity-h'

const { div, button } = createVanity(h, { key: '$' })

function FancyButton({ label, onClick }) {
  return button.class('fancy').onClick(onClick)(label)
}

// Chain props through the key, then call to render
// 通过 key 链式设置 props，最后调用以渲染
FancyButton.$.label('Save').onClick(handleSave)()
```

`key` **must be passed explicitly.** Without it, nothing is registered and `anyObject.key` stays `undefined` — this is deliberate, so the declared types can never disagree with what exists at runtime.

`key` **必须显式传入。** 不传则不会注册任何属性，`anyObject.key` 保持 `undefined`——这是刻意的：避免「类型声明了某个 key、运行时却没有」的不一致。

`createVanity(h, { key })` installs a getter on `Object.prototype`. Because the name is yours to choose, different renderers can register different keys and coexist in the same process.

`createVanity(h, { key })` 会在 `Object.prototype` 上安装一个 getter。名字由你决定，因此不同的渲染器可以注册不同的 key，共存于同一进程。

---

## TypeScript / 类型支持

```typescript
import { createVanity, type VanityH } from 'vanity-h'
import { h, type VNode } from 'your-renderer'

const vanity: VanityH<VNode> = createVanity(h)

// vanity.div, vanity.span, etc. are all typed
const element = vanity.div.class('test').id('app')('content')
```

The `VanityH<VNode, Child, HtmlElements>` type carries the renderer's node type, so your chainable elements return the correct VNode type for your renderer.

`VanityH<VNode, Child, HtmlElements>` 类型携带渲染器的节点类型，因此你的链式元素会为你的渲染器返回正确的 VNode 类型。

### Typing the `key` / 为 `key` 添加类型

`key` is typed separately from `createVanity`. The wrapper cannot know at compile time which name you pass at runtime, so the property is not part of the inferred type — declare it yourself by augmenting `VanityKeys`:

`key` 的类型与 `createVanity` 是分开的。包装器在编译期无法知道你在运行时传入了哪个名字，所以该属性不会自动出现在类型里——需要你通过增强 `VanityKeys` 自行声明：

```typescript
import { type ElementBuilder } from 'vanity-h'

// Augment once, in a .d.ts or any module of your project
// 声明一次即可，放在 .d.ts 或项目的任意模块中
declare global {
  interface VanityKeys {
    $: any
  }
}
```

Use a precise `ElementBuilder` instead of `any` to get typed props:

把 `any` 换成具体的 `ElementBuilder`，即可获得带类型的 props：

```typescript
declare global {
  interface VanityKeys {
    $: ElementBuilder<{ label?: string }, VNode>
  }
}

FancyButton.$.label('Save')   // ✓ typed
FancyButton.$.bad('x')        // ✗ error
```

Keep the declared key in sync with the `key` you pass to `createVanity` — nothing registers a property automatically, for you or the compiler.

声明的 key 必须与传给 `createVanity` 的 `key` 保持一致——无论对运行时还是编译器，都不会有属性被自动注册。

---

## What vanity-h Is Not / vanity-h 不是什么

vanity-h does not parse HTML. It does not introduce a component model. It does not manage state, track dependencies, or update the DOM. It is a syntax layer — a way to write hyperscript that looks as clean as the markup it produces. Your renderer handles the rest.

vanity-h 不解析 HTML。不引入组件模型。不管理状态，不追踪依赖，不更新 DOM。它是一个语法层——一种写 hyperscript 的方式，让它看起来和它产生的标记一样干净。其余由你的渲染器处理。

---

## License / 许可证

MIT
