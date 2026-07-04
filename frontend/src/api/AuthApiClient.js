import axios from 'axios';
import {AxiosConfig} from '../config/SiteConfig'
import { ACCESS_TOKEN_KEY } from '../utils/AuthStorage'
const AuthApiClient = axios.create(AxiosConfig)

AuthApiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default AuthApiClient;
