import { vanity, defineComponent } from 'vanity-h/vue'
import { createApp, type EmitFn, Transition } from 'vue'

const { div, img } = vanity

type DemoEmitsType = {
  run: () => void
  say: (word: string) => void
}

const Demo = defineComponent(
  (props: { name: string; age: number }, { emit }: { emit: EmitFn<DemoEmitsType> }) => {
    console.log(props)
    emit('run')
    emit('say', 'hi')
    return () => div.class('demo-class')('hello world', props.name, props.age)
  },
  {
    props: ['name', 'age'],
    emits: ['run', 'say']
  }
)

const Demo2 = defineComponent(
  (props: { name: string }) => {
    return () => div(props.name)
  },
  {
    props: ['name'],
    emits: { say: (word: string) => !!word, run: () => true }
  }
)

const App = defineComponent(() => {
  return () =>
    div(
      Transition.$vue.name('fade')(
        div
          .class({ style_class: true })
          .style({ color: 'red' })
          .onclick(() => {})()
      ),
      Demo.$vue
        .name('tom')
        .age(20)
        .onSay(() => {})
        .onRun(() => {})(),
      Demo2.$vue
        .name('tom')
        .onSay((word) => console.log(word))
        .onRun(() => {})(),
      img.class(['image-class']).style('height:100%').src('source-url').alt('123')()
    )
})

createApp(App).mount('#app')
