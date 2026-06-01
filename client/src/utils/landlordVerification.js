export const landlordVerificationSteps = [
  {
    number: 1,
    title: 'Identity Verification',
    detail: 'Upload your ID',
  },
  {
    number: 2,
    title: 'Property Verification',
    detail: 'Upload property proof',
  },
  {
    number: 3,
    title: 'Contact Verification',
    detail: 'Verify your phone number',
  },
]

const buildVerificationDocument = (key, label, values) => {
  const name = values.name || ''
  const url = values.url || ''

  if (!name && !url) {
    return null
  }

  return {
    key,
    label,
    name: name || label,
    url,
    mimeType: values.mimeType || '',
    size: values.size || 0,
  }
}

export const getLandlordVerificationStatus = (user) => {
  if (user?.role !== 'landlord') {
    return 'approved'
  }

  return user?.landlordVerificationStatus || 'approved'
}

export const getLandlordVerificationLabel = (status) => {
  switch (status) {
    case 'not_submitted':
      return 'Not submitted'
    case 'pending':
      return 'Pending'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Approved'
  }
}

export const getLandlordVerificationDocuments = (source) => {
  const verification = source?.landlordVerification || source || {}
  const identityDocument = buildVerificationDocument('identity', 'Ghana Card / Passport', {
    name: verification.identityDocumentName,
    url: verification.identityDocumentUrl,
    mimeType: verification.identityDocumentType,
    size: verification.identityDocumentSize,
  })

  const utilityBillDocument = buildVerificationDocument('utility_bill', 'Utility Bill', {
    name: verification.utilityBillDocumentName,
    url: verification.utilityBillDocumentUrl,
    mimeType: verification.utilityBillDocumentType,
    size: verification.utilityBillDocumentSize,
  })

  const propertyAgreementDocument = buildVerificationDocument(
    'property_agreement',
    'Property Agreement',
    {
      name: verification.propertyAgreementDocumentName || verification.propertyDocumentName,
      url: verification.propertyAgreementDocumentUrl || verification.propertyDocumentUrl,
      mimeType:
        verification.propertyAgreementDocumentType || verification.propertyDocumentType,
      size: verification.propertyAgreementDocumentSize || verification.propertyDocumentSize,
    },
  )

  return [identityDocument, utilityBillDocument, propertyAgreementDocument].filter(Boolean)
}

export const getLandlordVerificationRedirect = (user, fallback = '/dashboard') => {
  if (user?.role !== 'landlord') {
    return fallback
  }

  const status = getLandlordVerificationStatus(user)

  if (status === 'not_submitted' || status === 'rejected') {
    return '/landlord/verification'
  }

  if (status === 'pending') {
    return '/landlord/verification/submitted'
  }

  return fallback
}

export const canCreateLandlordListings = (user) =>
  getLandlordVerificationStatus(user) === 'approved'
