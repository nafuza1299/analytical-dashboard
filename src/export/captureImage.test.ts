import { describe, expect, it, vi } from 'vitest'
import { captureElementToPdf, captureElementToPng } from './captureImage'

const { html2canvasMock, addImageMock, saveMock, jsPDFCtorMock } = vi.hoisted(() => {
  const addImageMock = vi.fn()
  const saveMock = vi.fn()
  const jsPDFCtorMock = vi.fn().mockImplementation(function MockJsPDF(this: unknown) {
    Object.assign(this as object, { addImage: addImageMock, save: saveMock })
  })
  const fakeCanvas = {
    width: 800,
    height: 400,
    toBlob: (cb: (blob: Blob | null) => void) => cb(new Blob(['png'])),
    toDataURL: () => 'data:image/png;base64,fake',
  }
  return { html2canvasMock: vi.fn().mockResolvedValue(fakeCanvas), addImageMock, saveMock, jsPDFCtorMock }
})

vi.mock('html2canvas-pro', () => ({ default: html2canvasMock }))
vi.mock('jspdf', () => ({ default: jsPDFCtorMock }))

describe('captureElementToPng', () => {
  it('renders the element to a canvas and downloads it as a PNG blob', async () => {
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const element = document.createElement('div')

    await captureElementToPng(element, 'chart.png')

    expect(html2canvasMock).toHaveBeenCalledWith(element, { backgroundColor: null, scale: 2 })
    expect(anchorClick).toHaveBeenCalledOnce()
    anchorClick.mockRestore()
  })
})

describe('captureElementToPdf', () => {
  it('picks landscape orientation for a wider-than-tall canvas and embeds the image', async () => {
    const element = document.createElement('div')

    await captureElementToPdf(element, 'chart.pdf')

    expect(jsPDFCtorMock).toHaveBeenCalledWith({ orientation: 'landscape', unit: 'px', format: [800, 400] })
    expect(addImageMock).toHaveBeenCalledWith('data:image/png;base64,fake', 'PNG', 0, 0, 800, 400)
    expect(saveMock).toHaveBeenCalledWith('chart.pdf')
  })
})
