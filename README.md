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
  h('main', { class: 'card-body' }, [h('p', null, 'Content goes here')])
])
```

Every layer adds indentation. Attributes, events, and children interleave. The visual shape of the code has little to do with the shape of the DOM.

每一层都增加缩进。属性、事件和子节点混杂在一起。代码的视觉形态与 DOM 的结构几乎没有关联。

---

## The vanity-h Way / vanity-h 的方式

```js
div.class('card')(
  header.class('card-header')(h2('Title'), button.class('close').onClick(handleClose)('×')),
  main.class('card-body')(p('Content goes here'))
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
import createVanity from 'vanity-h'

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
  import createVanity from 'https://esm.sh/vanity-h'

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
import createVanity from 'vanity-h'

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

- Pass them as arguments to the final call. Strings, numbers, other elements, arrays — anything your hyperscript function accepts.
- 在最终调用中作为参数传入。字符串、数字、其他元素、数组——任意你的 hyperscript 函数接受的内容。

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

Use `x(Component)` — returned by `createVanity(h)` — to turn any component function into a chainable vanity-h element. This works with your own components, third‑party components, or anything that accepts props.

使用 `createVanity(h)` 返回的 `x(Component)` 可将任意组件函数转换为可链式调用的 vanity-h 元素。这适用于你自己的组件、第三方组件，或任何接受 props 的函数。

```js
import createVanity from 'vanity-h'
import { h } from 'your-renderer'

const { div, button, x } = createVanity(h)

function FancyButton({ label, onClick }) {
  return button.class('fancy').onClick(onClick)(label)
}

// Wrap with x() and chain props / 用 x() 包装并链式设置 props
x(FancyButton).label('Save').onClick(handleSave)()
```

Every object automatically gains a `$` property that is equivalent to calling `x()` on that object. The following is identical:

每个对象自动获得一个 `$` 属性，等价于对该对象调用 `x()`。以下写法完全等价：

```js
FancyButton.$.label('Save').onClick(handleSave)()
```

`$` requires no import — it is a global convenience. `x()` is the explicit form, available from `createVanity(h)`. Both are core features, not framework adapters. They work with any renderer, with no extra packages.

`$` 无需导入 —— 它是一个全局便捷属性。`x()` 是显式形式，从 `createVanity(h)` 中获取。两者都是核心特性，不是框架适配层。适用于任何渲染器，无需额外包。

---

## TypeScript / 类型支持

```typescript
import createVanity, { type VanityH } from 'vanity-h'
import { h, type VNode } from 'your-renderer'

const v: VanityH<VNode> = createVanity(h)

// v.div, v.span, etc. are all typed
const element = v.div.class('test').id('app')('content')
```

The `VanityH<R>` type carries the renderer's node type, so your chainable elements return the correct VNode type for your renderer.

`VanityH<R>` 类型携带渲染器的节点类型，因此你的链式元素会为你的渲染器返回正确的 VNode 类型。

---

## What vanity-h Is Not / vanity-h 不是什么

vanity-h does not parse HTML. It does not introduce a component model. It does not manage state, track dependencies, or update the DOM. It is a syntax layer — a way to write hyperscript that looks as clean as the markup it produces. Your renderer handles the rest.

vanity-h 不解析 HTML。不引入组件模型。不管理状态，不追踪依赖，不更新 DOM。它是一个语法层——一种写 hyperscript 的方式，让它看起来和它产生的标记一样干净。其余由你的渲染器处理。

---

## License / 许可证

MIT
