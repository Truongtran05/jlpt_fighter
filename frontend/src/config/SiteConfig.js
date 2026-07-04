const getEnv = (viteKey) => {
  return import.meta.env[viteKey];
};

export const AxiosConfig ={
    baseURL: getEnv('VITE_API_BASE_URL'),
    timeout: 10000,
    headers:{
        'Content-Type': 'application/json',
    }
}