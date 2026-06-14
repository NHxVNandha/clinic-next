import { createRoot } from 'react-dom/client'
import { ConfirmActionDialog, type ConfirmActionOptions } from '../components/confirm-action-dialog'

export async function confirmThemedAction(options: ConfirmActionOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    let settled = false

    const cleanup = () => {
      window.setTimeout(() => {
        root.unmount()
        container.remove()
      }, 0)
    }

    const finish = (confirmed: boolean) => {
      if (settled) return
      settled = true
      resolve(confirmed)
      cleanup()
    }

    root.render(<ConfirmActionDialog options={options} onDone={finish} />)
  })
}
