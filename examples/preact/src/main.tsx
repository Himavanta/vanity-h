import { render } from 'preact'
import { vanity, defineComponent } from 'vanity-h/preact'

const { div, main, img } = vanity

type PropsType = { name: string; age: number }

const Demo = defineComponent(({ name, age }: PropsType) => {
  return div('demo2', name, age, img.src('src-url')())
})

function App() {
  return div.className('div-class')(
    main(Demo.$preact.name('Tom').age(20)(), div.style({ color: 'red' })())
  )
}

render(<App />, document.getElementById('app')!)
