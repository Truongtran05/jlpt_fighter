export function attachAuthInterceptor(client, { refreshOrWait, onAuthFail, shouldRetryRequest } = {}) {
  if (!client?.interceptors?.response) {
    throw new Error("A valid axios client is required")
  }

  if (typeof refreshOrWait !== "function") {
    throw new Error("refreshOrWait is required")
  }

  const defaultShouldRetryRequest = (error, originalRequest) => {
    return error.response?.status === 401 && !originalRequest?._retry
  }

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (!originalRequest) {
        return Promise.reject(error)
      }

      const canRetry = (shouldRetryRequest ?? defaultShouldRetryRequest)(error, originalRequest)
      if (!canRetry) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await refreshOrWait()
        return client(originalRequest)
      } catch (refreshError) {
        if (typeof onAuthFail === "function") {
          onAuthFail(refreshError)
        }
        return Promise.reject(refreshError)
      }
    }
  )

  return client
}