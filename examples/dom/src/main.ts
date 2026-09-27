import './style.css'
import heroImg from './assets/hero.png'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import { type ElementBuilder } from 'vanity-h'
import { createDomVanity, type VanityProps } from 'vanity-h/dom'

import { setupCounter } from './counter.ts'
import { rox } from './rox.ts'

// `createDomVanity` 注册的 key 不带类型声明，使用方在这里补上
declare global {
  interface VanityKeys {
    $: ElementBuilder<VanityProps, Node, Node>
  }
}

const { vanity } = createDomVanity({ rox })

const { a, button, code, div, h1, h2, img, li, p, section, ul } = vanity

/** sprite 图标片段。dom 渲染器不处理 SVG 命名空间，以 innerHTML 内联进父元素 */
const icon = (name: string, className: string) =>
  `<svg class="${rox`${className}`}" role="presentation" aria-hidden="true"><use href="/icons.svg#${name}"></use></svg>`

/** 带图标的链接。`media` 为 `<img>` 节点或 SVG 的 innerHTML 片段 */
function Link({ href, label, media }: { href: string; label: string; media: Node | string }) {
  const anchor = a.href(href).target('_blank').rox(
    'flex items-center gap-8px px-12px py-6px rounded-6px text-16px color-text-h bg-social-bg no-underline transition-shadow hover:shadow lg:w-100% lg:justify-center lg:box-border',
  )
  return typeof media === 'string' ? anchor.innerHTML(media)(label) : anchor(media, label)
}

const linkItem = (href: string, label: string, media: Node | string) =>
  li.rox('lg:flex-half')(Link.$.href(href).label(label).media(media)())

/** 图标 + 标题 + 副标题 + 链接列表 */
function Panel({
  id,
  icon: iconName,
  title: heading,
  subtitle,
  children,
}: {
  id: string
  icon: string
  title: string
  subtitle: string
  children?: Node[]
}) {
  // `docs` 面板右侧与 `social` 分隔，窄屏时改为下边框（对应原 `.css` 的 lg 断点）
  const divider = id === 'docs' ? 'border-r lg:border-r-none lg:border-b' : ''
  return div
    .id(id)
    .rox(`flex-1 p-32px lg:py-24px lg:px-20px ${divider}`)
    .innerHTML(icon(iconName, 'w-22px h-22px mb-16px'))(h2(heading), p(subtitle), children ?? [])
}

const app = document.querySelector<HTMLDivElement>('#app')!

app.className = rox`
  w-1126px max-w-100% m-auto text-center border-x min-h-100svh flex-col box-border
`

app.append(
  section.id('center').rox(
    'flex-col gap-25px place-content-center place-items-center grow lg:gap-18px lg:pt-32px lg:px-20px lg:pb-24px',
  )(
    div.rox('relative')(
      img.src(heroImg).rox('relative z-0 w-170px inset-x-0 mx-auto').width(170).height(179).alt('')(),
      img.src(typescriptLogo)
        .rox('absolute z-1 top-34px h-28px inset-x-0 mx-auto transforms-framework')
        .alt('TypeScript logo')(),
      img.src(viteLogo)
        .rox('absolute z-0 top-107px h-26px w-auto inset-x-0 mx-auto transforms-vite')
        .alt('Vite logo')(),
    ),
    div(
      h1('Get started'),
      p('Edit ', code('src/main.ts'), ' and save to test ', code('HMR')),
    ),
    button
      .id('counter')
      .type('button')
      .rox(
        'inline-flex font-mono text-16px pt-5px pb-5px pl-10px pr-10px rounded-5px color-accent bg-accent-bg border-2px-solid-transparent transition-border mb-24px hover:border-color-accent-border focus-visible:outline',
      )(),
  ),

  div.class('ticks')(),

  section.id('next-steps').rox('flex border-t text-left lg:flex-col lg:text-center')(
    Panel.$.id('docs')
      .icon('documentation-icon')
      .title('Documentation')
      .subtitle('Your questions, answered')(
      ul.rox('list-none p-0 flex gap-8px mt-32px lg:mt-20px lg:flex-wrap lg:justify-center')(
        linkItem('https://vite.dev/', 'Explore Vite', img.src(viteLogo).rox('h-18px').alt('')()),
        linkItem(
          'https://www.typescriptlang.org',
          'Learn more',
          img.src(typescriptLogo).rox('w-18px h-18px').alt('')(),
        ),
      ),
    ),
    Panel.$.id('social')
      .icon('social-icon')
      .title('Connect with us')
      .subtitle('Join the Vite community')(
      ul.rox('list-none p-0 flex gap-8px mt-32px lg:mt-20px lg:flex-wrap lg:justify-center')(
        linkItem(
          'https://github.com/vitejs/vite',
          'GitHub',
          icon('github-icon', 'social-icon w-18px h-18px'),
        ),
        linkItem(
          'https://chat.vite.dev/',
          'Discord',
          icon('discord-icon', 'social-icon w-18px h-18px'),
        ),
        linkItem('https://x.com/vite_js', 'X.com', icon('x-icon', 'social-icon w-18px h-18px')),
        linkItem(
          'https://bsky.app/profile/vite.dev',
          'Bluesky',
          icon('bluesky-icon', 'social-icon w-18px h-18px'),
        ),
      ),
    ),
  ),

  div.class('ticks')(),

  section.id('spacer').rox('h-88px border-t lg:h-48px')(),
)

setupCounter(app.querySelector<HTMLButtonElement>('#counter')!)
