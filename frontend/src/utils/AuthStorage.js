export const CURRENT_USER_KEY = "currentUser"
export const AUTH_CHANGED_EVENT = "auth-changed"

export function getStoredUser() {
  const storedUser = localStorage.getItem(CURRENT_USER_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

export function saveAuthSession({user }) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function clearAuthSession() {
  localStorage.removeItem(CURRENT_USER_KEY)
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}
