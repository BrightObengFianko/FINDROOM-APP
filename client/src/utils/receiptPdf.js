import { formatCurrency, formatDate, formatDateTime } from './format'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 48
const MARGIN_TOP = 56
const MARGIN_BOTTOM = 48
const DEFAULT_FONT_SIZE = 11
const DEFAULT_LINE_GAP = 6
const textEncoder = new TextEncoder()

const byteLength = (value) => textEncoder.encode(value).length

const escapePdfText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ')

const wrapText = (value, maxCharacters = 48) => {
  const words = String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!words.length) {
    return ['']
  }

  const lines = []
  let current = words[0]

  for (const word of words.slice(1)) {
    if ((current + ' ' + word).length <= maxCharacters) {
      current += ` ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }

  lines.push(current)
  return lines
}

const safeFormatCurrency = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? formatCurrency(amount) : 'Not provided'
}

const safeFormatDate = (value) => {
  if (!value) {
    return 'Not provided'
  }

  try {
    return formatDate(value)
  } catch {
    return 'Not provided'
  }
}

const safeFormatDateTime = (value) => {
  if (!value) {
    return 'Not provided'
  }

  try {
    return formatDateTime(value)
  } catch {
    return 'Not provided'
  }
}

const buildFieldLines = (label, value) => {
  const resolvedValue = String(value ?? '').trim() || 'Not provided'
  const wrappedValue = wrapText(resolvedValue, 48)

  return [
    { text: `${label}: ${wrappedValue[0]}`, size: DEFAULT_FONT_SIZE, gapAfter: 2 },
    ...wrappedValue.slice(1).map((line) => ({
      text: `  ${line}`,
      size: DEFAULT_FONT_SIZE,
      gapAfter: 2,
    })),
  ]
}

const buildReceiptLines = (receipt) => [
  { text: 'FindRoom Booking Receipt', size: 20, gapAfter: 10 },
  {
    text: `Booking reference: ${receipt.bookingReference || 'Not provided'}`,
    size: DEFAULT_FONT_SIZE,
    gapAfter: 12,
  },
  { text: 'Room details', size: 13, gapAfter: 4 },
  ...buildFieldLines('Room title', receipt.roomTitle),
  ...buildFieldLines('Digital address', receipt.roomDigitalAddress),
  ...buildFieldLines('Location', receipt.roomLocation),
  ...buildFieldLines('Amount paid', safeFormatCurrency(receipt.amountPaid)),
  { text: '', size: DEFAULT_FONT_SIZE, gapAfter: 6 },
  { text: 'Booking details', size: 13, gapAfter: 4 },
  ...buildFieldLines('Booking ID', receipt.bookingId),
  ...buildFieldLines('Check-in date', safeFormatDate(receipt.checkInDate)),
  ...buildFieldLines('Duration', receipt.duration),
  ...buildFieldLines('Booking status', receipt.bookingStatus),
  { text: '', size: DEFAULT_FONT_SIZE, gapAfter: 6 },
  { text: 'Payment details', size: 13, gapAfter: 4 },
  ...buildFieldLines('Payment ID', receipt.paymentId),
  ...buildFieldLines('Payment method', receipt.paymentMethod),
  ...buildFieldLines('Paid at', safeFormatDateTime(receipt.paidAt)),
  ...buildFieldLines('Payment status', receipt.paymentStatus),
  { text: '', size: DEFAULT_FONT_SIZE, gapAfter: 6 },
  { text: 'Tenant information', size: 13, gapAfter: 4 },
  ...buildFieldLines('Tenant', receipt.tenantName),
  ...buildFieldLines('Email', receipt.tenantEmail),
  ...buildFieldLines('Phone', receipt.tenantPhone),
]

const paginateLines = (lines) => {
  const availableHeight = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM
  const pages = []
  let currentPage = []
  let remainingHeight = availableHeight

  for (const line of lines) {
    const lineHeight = line.lineHeight || line.size + DEFAULT_LINE_GAP
    const totalHeight = (line.gapBefore || 0) + lineHeight + (line.gapAfter || 0)

    if (currentPage.length > 0 && totalHeight > remainingHeight) {
      pages.push(currentPage)
      currentPage = []
      remainingHeight = availableHeight
    }

    currentPage.push({ ...line, lineHeight })
    remainingHeight -= totalHeight
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages.length ? pages : [[{ text: '', size: DEFAULT_FONT_SIZE, lineHeight: DEFAULT_FONT_SIZE + DEFAULT_LINE_GAP }]]
}

const renderPageContent = (lines) => {
  let y = PAGE_HEIGHT - MARGIN_TOP
  let content = ''

  lines.forEach((line) => {
    y -= line.gapBefore || 0

    if (line.text) {
      content += `BT /F1 ${line.size || DEFAULT_FONT_SIZE} Tf ${MARGIN_X} ${y} Td (${escapePdfText(
        line.text,
      )}) Tj ET\n`
    }

    y -= line.lineHeight
    y -= line.gapAfter || 0
  })

  return content
}

export const createReceiptPdfBlob = (receipt) => {
  const pages = paginateLines(buildReceiptLines(receipt))
  const pageStartObject = 4
  const contentStartObject = pageStartObject + pages.length
  const lastObjectNumber = contentStartObject + pages.length - 1
  const objects = new Array(lastObjectNumber + 1)

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pages
    .map((_, index) => `${pageStartObject + index} 0 R`)
    .join(' ')}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = pageStartObject + index
    const contentObjectNumber = contentStartObject + index
    const pageContent = renderPageContent(pageLines)

    objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    objects[contentObjectNumber] = `<< /Length ${byteLength(pageContent)} >>\nstream\n${pageContent}endstream`
  })

  let pdf = '%PDF-1.4\n'
  let offset = byteLength(pdf)
  const offsets = new Array(lastObjectNumber + 1).fill('0000000000')

  for (let objectNumber = 1; objectNumber <= lastObjectNumber; objectNumber += 1) {
    const body = objects[objectNumber]
    offsets[objectNumber] = String(offset).padStart(10, '0')

    const part = `${objectNumber} 0 obj\n${body}\nendobj\n`
    pdf += part
    offset += byteLength(part)
  }

  const xrefOffset = offset
  pdf += `xref\n0 ${lastObjectNumber + 1}\n0000000000 65535 f \n`

  for (let objectNumber = 1; objectNumber <= lastObjectNumber; objectNumber += 1) {
    pdf += `${offsets[objectNumber]} 00000 n \n`
  }

  pdf += `trailer << /Size ${lastObjectNumber + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}
