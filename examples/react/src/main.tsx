import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import vanity, { defineComponent } from 'vanity-h/react'

const { div, main, img } = vanity

type PropsType = { name: string; age: number }

const Demo = defineComponent(({ name, age }: PropsType) => {
  return div('demo2', name, age, img.src('src-url')())
})

function App() {
  return div.className('div-class')(
    main(Demo.$react.name('Tom').age(20)(), div.style({ color: 'red' })())
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
