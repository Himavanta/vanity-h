import './style.css'
import { type ElementBuilder } from 'vanity-h'
import { createDomVanity, type VanityProps } from 'vanity-h/dom'

import heroImg from './assets/hero.png'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import { rox } from './rox.ts'

// `createDomVanity` 注册的 key 不带类型声明，使用方在这里补上
declare global {
  interface VanityKeys {
    $: ElementBuilder<VanityProps, Element, Node>
  }
}

const { vanity } = createDomVanity({ rox })

const { a, button, code, div, h1, h2, img, li, p, section, ul } = vanity

/**
 * sprite 图标。dom 渲染器不处理 SVG 命名空间，这里用 `innerHTML` 解析出
 * 真实 SVG 元素（`<use>` 必须包在 `<svg>` 内）。
 * 用 `firstElementChild` 而非 `firstChild`，避免 markup 前导空白解析出文本节点。
 */
function Icon({ name, className }: { name: string; className: string }) {
  return div.innerHTML(
    `<svg class="${rox`${className}`}" role="presentation" aria-hidden="true"><use href="/icons.svg#${name}"></use></svg>`
  )().firstElementChild!
}

/** 带图标的链接 */
function Link({ href, label, media }: { href: string; label: string; media: Node }) {
  return a
    .href(href)
    .target('_blank')
    .rox(
      'flex items-center gap-8px px-12px py-6px rounded-6px text-16px color-text-h bg-social-bg no-underline transition-shadow hover:shadow lg:w-100% lg:justify-center lg:box-border'
    )(media, label)
}

/** 列表项：`li` 包一个 `Link` */
function LinkItem({ href, label, media }: { href: string; label: string; media: Node }) {
  return li.rox('lg:flex-half')(Link.$.href(href).label(label).media(media)())
}

/** 图标 + 标题 + 副标题 + 链接列表 */
function Panel({
  id,
  icon,
  title: heading,
  subtitle,
  links
}: {
  id: string
  icon: string
  title: string
  subtitle: string
  links: { href: string; label: string; media: Node }[]
}) {
  // `docs` 面板右侧与 `social` 分隔，窄屏时改为下边框（对应原 `.css` 的 lg 断点）
  const divider = id === 'docs' ? 'border-r lg:border-r-none lg:border-b' : ''
  return div.id(id).rox(`flex-1 p-32px lg:py-24px lg:px-20px ${divider}`)(
    Icon.$.name(icon).className('w-22px h-22px mb-16px')(),
    h2(heading),
    p(subtitle),
    ul.rox('list-none p-0 flex gap-8px mt-32px lg:mt-20px lg:flex-wrap lg:justify-center')(
      links.map(({ href, label, media }) => LinkItem.$.href(href).label(label).media(media)())
    )
  )
}

/** 可点击计数器 */
function Counter() {
  let count = 0

  return button
    .id('counter')
    .type('button')
    .rox(
      'inline-flex font-mono text-16px pt-5px pb-5px pl-10px pr-10px rounded-5px color-accent bg-accent-bg border-2px-solid-transparent transition-border mb-24px hover:border-color-accent-border focus-visible:outline'
    )
    .onclick(({ currentTarget }: MouseEvent) => {
      count += 1
      ;(currentTarget as HTMLButtonElement).textContent = `Count is ${count}`
    })('Count is 0')
}

const docsLinks = [
  {
    href: 'https://vite.dev/',
    label: 'Explore Vite',
    media: img.src(viteLogo).rox('h-18px').alt('')()
  },
  {
    href: 'https://www.typescriptlang.org',
    label: 'Learn more',
    media: img.src(typescriptLogo).rox('w-18px h-18px').alt('')()
  }
]

const socialLinks = [
  { href: 'https://github.com/vitejs/vite', label: 'GitHub', icon: 'github-icon' },
  { href: 'https://chat.vite.dev/', label: 'Discord', icon: 'discord-icon' },
  { href: 'https://x.com/vite_js', label: 'X.com', icon: 'x-icon' },
  { href: 'https://bsky.app/profile/vite.dev', label: 'Bluesky', icon: 'bluesky-icon' }
].map(({ href, label, icon }) => ({
  href,
  label,
  media: Icon.$.name(icon).className('social-icon w-18px h-18px')()
}))

// 一次插入整棵树（包含 `#app` 自身），到 `body`
void 'body'.append(
  div
    .id('app')
    .rox('w-1126px max-w-100% m-auto text-center border-x min-h-100svh flex-col box-border')(
    section
      .id('center')
      .rox(
        'flex-col gap-25px place-content-center place-items-center grow lg:gap-18px lg:pt-32px lg:px-20px lg:pb-24px'
      )(
      div.rox('relative')(
        img
          .src(heroImg)
          .rox('relative z-0 w-170px inset-x-0 mx-auto')
          .width(170)
          .height(179)
          .alt('')(),
        img
          .src(typescriptLogo)
          .rox('absolute z-1 top-34px h-28px inset-x-0 mx-auto transforms-framework')
          .alt('TypeScript logo')(),
        img
          .src(viteLogo)
          .rox('absolute z-0 top-107px h-26px w-auto inset-x-0 mx-auto transforms-vite')
          .alt('Vite logo')()
      ),
      div(h1('Get started'), p('Edit ', code('src/main.ts'), ' and save to test ', code('HMR'))),
      Counter()
    ),

    div.class('ticks')(),

    section.id('next-steps').rox('flex border-t text-left lg:flex-col lg:text-center')(
      Panel.$.id('docs')
        .icon('documentation-icon')
        .title('Documentation')
        .subtitle('Your questions, answered')
        .links(docsLinks)(),
      Panel.$.id('social')
        .icon('social-icon')
        .title('Connect with us')
        .subtitle('Join the Vite community')
        .links(socialLinks)()
    ),

    div.class('ticks')(),

    section.id('spacer').rox('h-88px border-t lg:h-48px')()
  )
)
