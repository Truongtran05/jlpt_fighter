export const errorMapper = (error) => {
    return {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "An unexpected error occurred",
        details: error.response?.data?.details || null,
    }
}