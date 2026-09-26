import { render } from 'preact'
import vanity, { defineComponent } from 'vanity-h/preact'

const { x, div, main, img } = vanity

type PropsType = { name: string; age: number }

function Demo({ name, age }: PropsType) {
  return div('demo2', name, age, img.src('src-url')())
}

const Demo2 = defineComponent(({ name, age }: PropsType) => {
  return div('demo2', name, age, img.src('src-url')())
})

function App() {
  return div.className('div-class')(
    main(
      x(Demo).name('Tom').age(20)(),
      Demo2.$.name('Tom').age(20)(),
      div.style({ color: 'red' })()
    )
  )
}

render(<App />, document.getElementById('app')!)
