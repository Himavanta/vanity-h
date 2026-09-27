import { createConfig, createRox } from 'roxcss'

/**
 * 页面的 roxcss 实例。
 *
 * 基于默认预设（`createConfig`），页面私有词汇通过 overrides 递归合并：
 * 颜色、边框、阴影等使用 `style.css` 中 `:root` 的 CSS 变量，
 * 因此暗色模式（`prefers-color-scheme` 切换变量值）依然生效。
 *
 * 值一律原样使用，单位由调用者写全，如 `w-170px`。
 */

/** 段数组 → `var()` 引用，如 `["accent", "bg"]` → `var(--accent-bg)` */
const cssVar = (segments: string[]) => `var(--${segments.join('-')})`

export const rox = createRox(
  createConfig({
    modifiers: {
      // 页面响应式断点是 max-width 1024px，覆盖默认的 min-width 语义
      lg: (selector, cssDecl) => `@media (max-width: 1024px) { ${selector} { ${cssDecl} } }`,
    },
    matchers: {
      // 页面 CSS 变量体系
      color: (...segments) => `color:${cssVar(segments)}`,
      bg: (...segments) => `background:${cssVar(segments)}`,
      border: {
        t: () => 'border-top:1px solid var(--border)',
        b: () => 'border-bottom:1px solid var(--border)',
        // 带值时覆盖（如 border-r-none → border-right:none）
        r: (v?: string) => (v == null ? 'border-right:1px solid var(--border)' : `border-right:${v}`),
        x: () => 'border-inline:1px solid var(--border)',
        color: (...segments) => `border-color:${cssVar(segments)}`,
      },
      outline: () => 'outline:2px solid var(--accent);outline-offset:2px',
      shadow: () => 'box-shadow:var(--shadow)',
      transition: {
        border: () => 'transition:border-color 0.3s',
        shadow: () => 'transition:box-shadow 0.3s',
      },
      // 页面使用 monospace 变量
      font: {
        mono: () => 'font-family:var(--mono)',
      },
      // 两栏布局各占一半（用于 lg 断点下的列表项）
      flex: {
        half: () => 'flex:1 1 calc(50% - 8px)',
      },
      // hero 的 3D 变换，值较复杂，命名为具名 matcher
      transforms: {
        framework: () =>
          'transform:perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.4)',
        vite: () =>
          'transform:perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.8)',
      },
    },
  }),
)
