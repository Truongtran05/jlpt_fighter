
const baseURL = import.meta.env['VITE_API_BASE_URL']
const baseAPIURL = import.meta.env['VITE_API_BASE_API_URL']
export const AuthEndPoints = {
    "login" : `${baseURL}/login/`,
    "logout" : `${baseURL}/logout/`,
    "register" : `${baseURL}/register/`,
    "me" : `${baseURL}/me/`,
    "refreshToken" : `${baseAPIURL}/token/refresh/`
}
