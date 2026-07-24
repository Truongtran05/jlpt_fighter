import axios from "axios"
import {httpConfig, authHttpConfig} from "./HttpConfig"

export const ClientFactory = (isAuth) => {
    const config = isAuth ? authHttpConfig : httpConfig
    return axios.create(config)
}