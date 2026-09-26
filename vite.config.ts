import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: 'src/*.ts',
    dts: true,
    minify: true,
    platform: 'neutral',
    exports: { inlinedDependencies: false }
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true
    }
  },
  fmt: {
    semi: false,
    sortImports: {},
    singleQuote: true,
    trailingComma: 'none',
    jsxSingleQuote: true
  }
})
