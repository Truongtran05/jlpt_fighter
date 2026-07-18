import axios from 'axios';
import {AxiosConfig} from '../config/SiteConfig'

const ApiClient = axios.create({
    ...AxiosConfig,
    withCredentials: true
})
export default ApiClient;
