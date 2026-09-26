import { defineComponent, type PropType } from 'vue'

const Demo = defineComponent(
  () => {
    return () => null
  },
  {
    props: {
      text: String as PropType<string>
    }
  }
)

type DemoType = typeof Demo
type Check = DemoType extends { __typeProps?: infer P } ? P : 'no __typeProps'
type Check2 = DemoType extends { __props?: infer P } ? P : 'no __props'
type Check3 = DemoType extends { $props?: infer P } ? P : 'no $props'

const x: Check = null as any
const y: Check2 = null as any
const z: Check3 = null as any
