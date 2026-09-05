import html2canvas from 'html2canvas-pro'

/** Reads the live theme token so captures match whichever theme is on screen. */
function themeBackground(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#ffffff'
}

export async function captureElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, { backgroundColor: themeBackground(), scale: 2 })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function captureElementToPng(element: HTMLElement, filename: string) {
  const canvas = await captureElementToCanvas(element)
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename)
      resolve()
    }, 'image/png')
  })
}

export async function captureElementToPdf(element: HTMLElement, filename: string) {
  const canvas = await captureElementToCanvas(element)
  const { default: jsPDF } = await import('jspdf')
  const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] })
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(filename)
}
