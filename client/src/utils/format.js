const currencyFormatter = new Intl.NumberFormat('en-GH', {
  maximumFractionDigits: 0,
})

const normalizeCurrencyValue = (value) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    return Number(value.replace(/[^0-9.-]/g, ''))
  }

  return Number(value)
}

const normalizeDateValue = (value) => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    const dateOnlyMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch
      return new Date(Number(year), Number(month) - 1, Number(day), 12)
    }

    return new Date(normalizedValue)
  }

  return new Date(value)
}

const formatDateInputParts = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

export const formatCurrency = (value) => {
  const amount = normalizeCurrencyValue(value)

  return `GHS ${currencyFormatter.format(Number.isFinite(amount) ? amount : 0)}`
}

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

export const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(normalizeDateValue(value))

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(normalizeDateValue(value))

export const toDateInputValue = (value) => {
  const candidate = normalizeDateValue(value || new Date())

  if (Number.isNaN(candidate.getTime())) {
    return formatDateInputParts(new Date())
  }

  return formatDateInputParts(candidate)
}

export const formatFileSize = (value) => {
  const size = Number(value)

  if (!Number.isFinite(size) || size <= 0) {
    return ''
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
