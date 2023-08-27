import { ValidatedForm, zfd } from '@makerx/forms-mui'
import { custom } from '@makerx/use-wallet'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import * as z from 'zod'
import CopyToClipBoard from './copyToClipBoard'
import { ManualSigningProvider, useManualWalletModal, useSetShowManualWalletModal } from './manualSigningProvider'

const formSchema = zfd.formData({
  signedPayload: zfd.text(z.string().trim().min(1, 'Required')),
})
type Fields = z.infer<typeof formSchema>

const ManualWallet = (props: { manualWalletClient: custom | undefined }) => {
  const manualWalletModal = useManualWalletModal()
  const setShowManualWalletModal = useSetShowManualWalletModal()

  const provider = props.manualWalletClient?.providerProxy as ManualSigningProvider | undefined

  const onClose = () => {
    provider?.cancelled()
    setShowManualWalletModal(false)
  }

  const onSubmit = (data: Fields) => {
    provider?.submitted(data.signedPayload)
    setShowManualWalletModal(false)
  }

  return (
    <Dialog open={manualWalletModal.showManualWalletModal} onClose={onClose}>
      <DialogTitle>
        <strong>Manual transaction signing</strong>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <div>
            <Typography>Here is the base64 unsigned transaction you need to sign</Typography>
            <div className="text-purple-900 bg-purple-light rounded-md p-2">
              <code className="break-words">{manualWalletModal.payloadToSign}</code>
            </div>
            <p>
              <strong>Instructions (using goal)</strong>
            </p>
            <ol>
              <li>
                <div className="flex">
                  <span className="flex-shrink">Copy the unsigned transaction payload </span>
                  <CopyToClipBoard className="flex-1 w-4 h-4 ml-2 hover:text-purple" valueToCopy={manualWalletModal.payloadToSign} />
                </div>
              </li>
              <li>
                Load the value from the clipboard into a binary file e.g.
                <div className="text-purple-900 bg-purple-light rounded-md p-1">
                  <code>
                    echo {'{'}paste value{'}'} | base64 -d &gt; unsigned.txn
                  </code>
                </div>
              </li>
              <li>
                Inspect it to understand what you are signing e.g.
                <div className="text-purple-900 bg-purple-light rounded-md p-1">
                  <code>goal clerk inspect unsigned.txn</code>
                </div>
              </li>
              <li>
                Sign the transaction e.g.
                <div className="text-purple-900 bg-purple-light rounded-md p-1">
                  <code>goal clerk sign -i unsigned.txn -o signed.txn</code>
                </div>
              </li>
              <li>
                Output the signed transaction in base64 format e.g.
                <div className="text-purple-900 bg-purple-light rounded-md p-1">
                  <code>cat signed.txn | base64</code>
                </div>
              </li>
              <li>Copy the signed transaction output to clipboard</li>
              <li>Past the value below and hit submit.</li>
            </ol>
            <hr />
            <ValidatedForm className="flex-row space-y-4" validator={formSchema} onSubmit={onSubmit}>
              {(helper) => (
                <>
                  {helper.textField({
                    label: 'Base64 signed transaction',
                    field: 'signedPayload',
                  })}
                  <div className="text-right">{helper.submitButton({ label: 'Submit', className: 'mt-8' })}</div>
                </>
              )}
            </ValidatedForm>
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="mr-1">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default ManualWallet