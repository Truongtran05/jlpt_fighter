let refreshPromise = null

export function createRefreshManager({ refreshFn, onRefreshFail }) {
  if (typeof refreshFn !== "function") {
    throw new Error("refreshFn is required")
  }

  async function refreshOrWait() {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          await refreshFn()
        } catch (error) {
          if (typeof onRefreshFail === "function") {
            onRefreshFail(error)
          }
          throw error
        } finally {
          refreshPromise = null
        }
      })()
    }

    return refreshPromise
  }

  function isRefreshing() {
    return refreshPromise !== null
  }

  return {
    refreshOrWait,
    isRefreshing,
  }
}