/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { mockUsers } from '../data/mockData'
import api, { isMockToken, setAuthToken } from '../lib/api'
import { canAssumeRole, hydrateUserRoles } from '../utils/roles'

const AUTH_STORAGE_KEY = 'findroom-auth'
const MOCK_USERS_STORAGE_KEY = 'findroom-mock-users'
const PLATFORM_USER_OVERRIDES_STORAGE_KEY = 'findroom-platform-user-overrides'
const LEGACY_MULTI_ROLE_USER_ID = 'bright-1'
const REMOVED_DEMO_USER_IDS = new Set([
  'landlord-1',
  'user-1',
  'user-2',
  LEGACY_MULTI_ROLE_USER_ID,
])
const REMOVED_DEMO_USER_EMAILS = new Set([
  'ama.serwaa@findroom.local',
  'kwaku.mensah@findroom.local',
  'user@findroom.dev',
  'landlord@findroom.dev',
  'admin@findroom.dev',
  'david@example.com',
])

const defaultVerificationFieldsForRole = (role) =>
  role === 'landlord'
    ? {
        landlordVerificationStatus: 'not_submitted',
        landlordVerificationSubmittedAt: '',
        landlordVerificationReviewedAt: '',
        landlordVerification: null,
      }
    : {}

const withRoleDefaults = (user, role) => {
  if (!user) {
    return user
  }

  return {
    ...defaultVerificationFieldsForRole(role),
    ...user,
  }
}

const AuthContext = createContext(null)

const sanitizeUser = (user, preferredRole) => {
  if (!user) {
    return null
  }

  const safeUser = { ...user }
  delete safeUser.password
  return hydrateUserRoles(safeUser, preferredRole)
}

const isNetworkFailure = (error) =>
  !error?.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error'

const isRemovedDemoUser = (user) =>
  REMOVED_DEMO_USER_IDS.has(user?.id) ||
  REMOVED_DEMO_USER_EMAILS.has(user?.email?.toLowerCase?.())

const removeDeletedDemoUsers = (users = []) =>
  users.filter((candidate) => !isRemovedDemoUser(candidate))

const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }

  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (!storedSession) {
      return { token: null, user: null }
    }

    const parsedSession = JSON.parse(storedSession)

    if (!parsedSession?.token || !parsedSession?.user) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return { token: null, user: null }
    }

    if (isRemovedDemoUser(parsedSession.user)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return { token: null, user: null }
    }

    return {
      token: parsedSession.token,
      user: sanitizeUser(parsedSession.user, parsedSession.user?.role),
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return { token: null, user: null }
  }
}

const getStoredMockUsers = () => {
  const stored = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY)

  if (!stored) {
    window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(mockUsers))
    return mockUsers
  }

  const storedUsers = JSON.parse(stored)
  const nextUsers = removeDeletedDemoUsers(storedUsers)

  mockUsers.forEach((candidate) => {
    const exists = nextUsers.some(
      (storedCandidate) =>
        storedCandidate.id === candidate.id ||
        storedCandidate.email?.toLowerCase() === candidate.email.toLowerCase(),
    )

    if (!exists) {
      nextUsers.push(candidate)
    }
  })

  if (nextUsers.length !== storedUsers.length) {
    window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(nextUsers))
  }

  return nextUsers
}

const persistMockUsers = (users) => {
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

const getStoredPlatformUserOverrides = () => {
  const stored = window.localStorage.getItem(PLATFORM_USER_OVERRIDES_STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    const storedUsers = Array.isArray(parsed) ? parsed : []
    const users = removeDeletedDemoUsers(storedUsers)

    if (users.length !== storedUsers.length) {
      persistPlatformUserOverrides(users)
    }

    return users
  } catch {
    return []
  }
}

const persistPlatformUserOverrides = (users) => {
  window.localStorage.setItem(PLATFORM_USER_OVERRIDES_STORAGE_KEY, JSON.stringify(users))
}

const updateStoredPlatformUserOverrides = (userId, updates) => {
  const currentUsers = getStoredPlatformUserOverrides()
  const nextUsers = []
  let matched = false

  currentUsers.forEach((candidate) => {
    if (candidate.id !== userId) {
      nextUsers.push(candidate)
      return
    }

    matched = true
    nextUsers.push({ ...candidate, ...updates })
  })

  if (!matched) {
    nextUsers.unshift({ id: userId, ...updates })
  }

  persistPlatformUserOverrides(nextUsers)
}

const cleanupStoredDemoData = () => {
  if (typeof window === 'undefined') {
    return
  }

  getStoredMockUsers()
  getStoredPlatformUserOverrides()
}

cleanupStoredDemoData()

export function AuthProvider({ children }) {
  const storedSession = readStoredSession()
  const [token, setToken] = useState(storedSession.token)
  const [user, setUser] = useState(storedSession.user)
  const [loading, setLoading] = useState(Boolean(storedSession.token && !isMockToken(storedSession.token)))

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    let cancelled = false

    const syncSessionUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      if (isMockToken(token)) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const response = await api.get('/users/me')
        const refreshedUser = sanitizeUser(response.data?.user, response.data?.user?.role)

        if (!cancelled && refreshedUser) {
          setUser(refreshedUser)
          window.localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ token, user: refreshedUser }),
          )
        }
      } catch {
        // Keep the stored session if the refresh call is temporarily unavailable.
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    syncSessionUser()

    return () => {
      cancelled = true
    }
  }, [token])

  const persistSession = (session) => {
    const nextSession = {
      token: session.token,
      user: sanitizeUser(session.user, session.user?.role),
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
    setToken(nextSession.token)
    setUser(nextSession.user)
    setAuthToken(nextSession.token)
  }

  const login = async (payload) => {
    try {
      const response = await api.post('/auth/login', payload)
      persistSession(response.data)
      return response.data
    } catch (error) {
      if (!isNetworkFailure(error)) {
        throw new Error(
          error.response?.data?.message || error.message || 'Invalid login credentials.',
          { cause: error },
        )
      }

      const users = getStoredMockUsers()
      const match = users.find(
        (candidate) =>
          candidate.email.toLowerCase() === payload.email.toLowerCase() &&
          candidate.password === payload.password &&
          canAssumeRole(candidate, payload.role),
      )

      if (!match) {
        throw new Error('Invalid email or password.', { cause: error })
      }

      const session = {
        token: `mock-token-${match.id}`,
        user: sanitizeUser(match, payload.role),
      }

      persistSession(session)
      return session
    }
  }

  const signup = async (payload) => {
    try {
      const response = await api.post('/auth/signup', payload)
      const role = response.data?.user?.role || payload.role
      const nextSession = {
        ...response.data,
        user: withRoleDefaults(response.data?.user, role),
      }

      persistSession(nextSession)
      return nextSession
    } catch (error) {
      if (!isNetworkFailure(error)) {
        throw new Error(
          error.response?.data?.message || error.message || 'Unable to create account.',
          { cause: error },
        )
      }

      const users = getStoredMockUsers()
      const alreadyExists = users.some(
        (candidate) => candidate.email.toLowerCase() === payload.email.toLowerCase(),
      )

      if (alreadyExists) {
        throw new Error('An account with that email already exists.', { cause: error })
      }

      const createdUser = {
        id: `${payload.role}-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        phone: '',
        bio: '',
        avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(payload.email)}`,
        ...withRoleDefaults({}, payload.role),
      }
      const hydratedUser = hydrateUserRoles(createdUser, payload.role)

      const nextUsers = [hydratedUser, ...users]
      persistMockUsers(nextUsers)

      const session = {
        token: `mock-token-${hydratedUser.id}`,
        user: sanitizeUser(hydratedUser, payload.role),
      }

      persistSession(session)
      return session
    }
  }

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }

  const updateSessionUser = (updates) => {
    if (!user) {
      return
    }

    const nextUser = sanitizeUser({ ...user, ...updates }, updates.role || user.role)
    setUser(nextUser)
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, user: nextUser }),
    )

    const users = getStoredMockUsers()
    const matchingUserExists = users.some((candidate) => candidate.id === user.id)
    const nextUsers = matchingUserExists
      ? users.map((candidate) => (candidate.id === user.id ? { ...candidate, ...updates } : candidate))
      : [{ ...nextUser }, ...users]
    persistMockUsers(nextUsers)
    updateStoredPlatformUserOverrides(user.id, nextUser)
  }

  const setActiveRole = (preferredRole) => {
    if (!user || !canAssumeRole(user, preferredRole)) {
      return false
    }

    updateSessionUser({ role: preferredRole })
    return true
  }

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    signup,
    logout,
    updateSessionUser,
    setActiveRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
