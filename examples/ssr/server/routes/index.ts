import type { H3Event } from 'nitro'
import { html } from 'nitro'
import { raw } from 'nitro/h3'
import { CLIENT_RUNTIME, vanity, css } from 'vanity-h/ssr'

const {
  a,
  body,
  button,
  code,
  div,
  h1,
  h2,
  head,
  html: htmlTag,
  img,
  li,
  link: linkTag,
  meta,
  p,
  script,
  section,
  svg,
  title,
  ul,
  use
} = vanity

// ── 组件 ──────────────────────────────────────────────

/** sprite 图标（`<use>` 必须包裹在 `<svg>` 内） */
function Icon({ name, className }: { name: string; className: string }) {
  return svg.class(className).role('presentation')['aria-hidden']('true')(
    use.href(`/icons.svg#${name}`)()
  )
}

/** 带图标的外部链接 */
function ExternalLink({ href, name, icon }: { href: string; name: string; icon: string }) {
  return li(
    a.href(href).target('_blank').rel('noreferrer')(
      Icon.$ssr.name(icon).className('button-icon')(),
      name
    )
  )
}

/** 标题 + 副标题 + 图标的内容面板，子节点为链接列表 */
function Panel({
  id,
  icon,
  title: heading,
  subtitle,
  children
}: {
  id: string
  icon: string
  title: string
  subtitle: string
  children?: unknown
}) {
  return div.id(id)(Icon.$ssr.name(icon).className('icon')(), h2(heading), p(subtitle), children)
}

/** 可点击计数器 */
function Counter() {
  return button.id('counter').type('button').class('counter')('Count is 0')
}

const LINKS = {
  docs: [
    { href: 'https://vite.dev/', name: 'Explore Vite', icon: 'documentation-icon' },
    { href: 'https://nitro.build/', name: 'Explore Nitro', icon: 'documentation-icon' }
  ],
  social: [
    { href: 'https://github.com/vitejs/vite', name: 'GitHub', icon: 'github-icon' },
    { href: 'https://chat.vite.dev/', name: 'Discord', icon: 'discord-icon' },
    { href: 'https://x.com/vite_js', name: 'X.com', icon: 'x-icon' },
    { href: 'https://bsky.app/profile/vite.dev', name: 'Bluesky', icon: 'bluesky-icon' }
  ]
}

const COUNTER_SCRIPT = (current: HTMLScriptElement | null) => {
  const el = current?.parentElement?.querySelector<HTMLButtonElement>('#counter')
  if (!el) return
  let count = 0
  el.textContent = `Count is ${count}`
  el.addEventListener('click', () => {
    count += 1
    el.textContent = `Count is ${count}`
  })
}

export default (_event: H3Event) => {
  return html(
    raw(
      htmlTag.lang('en')(
        head(
          meta.charset('UTF-8')(),
          linkTag.rel('icon').type('image/svg+xml').href('/favicon.svg')(),
          meta.name('viewport').content('width=device-width, initial-scale=1.0')(),
          title('vanity-h · SSR'),
          script(CLIENT_RUNTIME),
          css`
            @import '/styles.css';
          `
        ),
        body(
          div.id('app')(
            section.id('center')(
              div.class('hero')(
                img.src('/hero.png').class('base').width(170).height(179).alt('')(),
                img.src('/typescript.svg').class('framework').alt('TypeScript logo')(),
                img.src('/vite.svg').class('vite').alt('Vite logo')()
              ),
              div(
                h1('Get started'),
                p('Edit ', code('server/routes/index.ts'), ' and save to test ', code('HMR'))
              ),
              Counter()
            ),
            div.class('ticks')(),
            section.id('next-steps')(
              Panel.$ssr
                .id('docs')
                .icon('documentation-icon')
                .title('Documentation')
                .subtitle('Your questions, answered')(
                ul(
                  ...LINKS.docs.map((item) =>
                    ExternalLink.$ssr.href(item.href).name(item.name).icon(item.icon)()
                  )
                )
              ),
              Panel.$ssr
                .id('social')
                .icon('social-icon')
                .title('Connect with us')
                .subtitle('Join the community')(
                ul(
                  ...LINKS.social.map((item) =>
                    ExternalLink.$ssr.href(item.href).name(item.name).icon(item.icon)()
                  )
                )
              )
            ),
            div.class('ticks')(),
            section.id('spacer')(),
            script(COUNTER_SCRIPT)
          )
        )
      )
    )
  )
}
