import { adminWorkspaceSeed } from '../data/mockAdminWorkspace'

const ADMIN_WORKSPACE_STORAGE_KEY = 'findroom-admin-workspace'
const ADMIN_WORKSPACE_SYNC_EVENT = 'findroom-admin-workspace-sync'

const cloneSeed = () => JSON.parse(JSON.stringify(adminWorkspaceSeed))

const normalizeLookupValue = (value = '') => String(value).trim().toLowerCase()

const notifyAdminWorkspaceSync = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(ADMIN_WORKSPACE_SYNC_EVENT))
}

export const loadAdminWorkspace = () => {
  if (typeof window === 'undefined') {
    return cloneSeed()
  }

  const stored = window.localStorage.getItem(ADMIN_WORKSPACE_STORAGE_KEY)

  if (!stored) {
    const seed = cloneSeed()
    window.localStorage.setItem(ADMIN_WORKSPACE_STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    return { ...cloneSeed(), ...JSON.parse(stored) }
  } catch {
    const seed = cloneSeed()
    window.localStorage.setItem(ADMIN_WORKSPACE_STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

export const persistAdminWorkspace = (workspace) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ADMIN_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace))
}

export const upsertAdminWorkspaceLandlord = (landlord) => {
  if (typeof window === 'undefined' || !landlord) {
    return null
  }

  const workspace = loadAdminWorkspace()
  const lookupId = landlord.id || ''
  const lookupEmail = normalizeLookupValue(landlord.email)
  const nextLandlord = {
    ...landlord,
    status: landlord.status || 'Active',
  }

  const nextLandlords = workspace.landlords.some(
    (candidate) =>
      candidate.id === lookupId ||
      normalizeLookupValue(candidate.email) === lookupEmail,
  )
    ? workspace.landlords.map((candidate) =>
        candidate.id === lookupId || normalizeLookupValue(candidate.email) === lookupEmail
          ? { ...candidate, ...nextLandlord }
          : candidate,
      )
    : [nextLandlord, ...workspace.landlords]

  const nextWorkspace = {
    ...workspace,
    landlords: nextLandlords,
  }

  persistAdminWorkspace(nextWorkspace)
  notifyAdminWorkspaceSync()
  return nextWorkspace
}

export const resetAdminWorkspace = () => {
  const seed = cloneSeed()
  persistAdminWorkspace(seed)
  notifyAdminWorkspaceSync()
  return seed
}
