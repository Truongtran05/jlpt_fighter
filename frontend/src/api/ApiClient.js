import axios from 'axios';
import {AxiosConfig} from '../config/SiteConfig'

const ApiClient = axios.create(AxiosConfig)
export default ApiClient;
