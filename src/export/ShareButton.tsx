import { useMemo, useState } from 'react'
import { Button } from '../catalyst-ui/components/Button/Button'
import { Modal } from '../catalyst-ui/components/Modal/Modal'
import { buildShareUrl } from '../filters/shareLink'
import type { FilterValues } from '../filters/registry'

interface Props {
  values: FilterValues
}

export function ShareButton({ values }: Props) {
  const [open, setOpen] = useState(false)
  const [includeFilters, setIncludeFilters] = useState(true)
  const [copied, setCopied] = useState(false)

  const url = useMemo(() => buildShareUrl(values, includeFilters), [values, includeFilters])

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-3.9M8.6 13.5l6.8 3.9" />
        </svg>
        Share Page
      </Button>

      <Modal open={open} onOpenChange={setOpen} size="sm">
        <Modal.Header>
          <Modal.Title>Share page</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="radio"
                name="shareMode"
                checked={includeFilters}
                onChange={() => setIncludeFilters(true)}
                className="h-4 w-4 accent-primary"
              />
              With current filter settings
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="radio"
                name="shareMode"
                checked={!includeFilters}
                onChange={() => setIncludeFilters(false)}
                className="h-4 w-4 accent-primary"
              />
              Without filter settings
            </label>

            <div className="flex gap-2 mt-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="flex-1 min-w-0 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button variant="secondary" size="sm" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
