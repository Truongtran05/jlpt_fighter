// AuthApiClient.js
import axios from "axios"
import { AxiosConfig } from "../config/SiteConfig"
import ApiClient from "./ApiClient"
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearAuthSession,
} from "../utils/AuthStorage"

const AuthApiClient = axios.create(AxiosConfig)

AuthApiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

AuthApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      clearAuthSession()
      return Promise.reject(error)
    }

    try {
      const refreshUrl = new URL("../token/refresh/", `${ApiClient.defaults.baseURL}/`).toString()
      const response = await ApiClient.post(refreshUrl, { refresh: refreshToken })

      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access)

      if (response.data.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh)
      }

      originalRequest.headers.Authorization = `Bearer ${response.data.access}`
      return AuthApiClient(originalRequest)
    } catch (refreshError) {
      clearAuthSession()
      return Promise.reject(refreshError)
    }
  }
)

export default AuthApiClient