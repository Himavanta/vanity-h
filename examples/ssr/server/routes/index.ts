import type { H3Event } from 'nitro'
import { html } from 'nitro'
import { raw } from 'nitro/h3'
import { CLIENT_RUNTIME, vanity, css } from 'vanity-h/ssr'

const { input, div, script, body } = vanity

function demo({ children }: { children: unknown }) {
  return div('组件插槽：', div(children))
}

export default (_event: H3Event) => {
  function bindEv({ parentElement }: HTMLOrSVGScriptElement) {
    console.log(parentElement)
    parentElement!.onclick = () => {
      alert('alert message')
    }
  }

  return html(
    raw(
      body(
        script(CLIENT_RUNTIME),
        css`
          body {
            margin: 0;
          }
        `,
        div.style('background:red;display:flex;flex-direction:column;')(
          input.id('input1')(),
          input.id('input2')(),
          input.id('input3')(),
          input.id('input4')(),
          input.id('input5')(),
          input.id('input6')(),
          demo.$ssr(div('content'), 'content2'),
          script(bindEv)
        )
      )
    )
  )
}
