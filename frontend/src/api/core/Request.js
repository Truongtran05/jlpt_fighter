import {errorMapper} from "../core/ErrorMapper"

export const request = async (client, method, url, data = null, config = {}) => {
    try {
        const response = await client.request({
            method,
            url,
            data,
            ...config
        })
        return response
    } catch (error) {
        throw errorMapper(error)
    }
}