import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
})

const isMockToken = (token) => typeof token === 'string' && token.startsWith('mock-token-')

export const setAuthToken = (token) => {
  if (token && !isMockToken(token)) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export default api
