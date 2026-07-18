// AuthApiClient.js
import axios from "axios"
import { AxiosConfig } from "../config/SiteConfig"
import ApiClient from "./ApiClient"
import {
  clearAuthSession,
} from "../utils/AuthStorage"

const AuthApiClient = axios.create({
  ...AxiosConfig,
  withCredentials: true
})

AuthApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const refreshUrl = new URL("../token/refresh/", `${ApiClient.defaults.baseURL}/`).toString()
      const response = await ApiClient.post(refreshUrl, {}, {withCredentials: true})
      return AuthApiClient(originalRequest)
    } catch (refreshError) {
      clearAuthSession()
      return Promise.reject(refreshError)
    }
  }
)

export default AuthApiClient