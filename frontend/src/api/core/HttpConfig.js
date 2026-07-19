
export const authHttpConfig = {
  "baseURL" : import.meta.env['VITE_API_BASE_URL'],
  "timeout": 10000,
  "withCredentials": true,
  "headers": {
    'Content-Type': 'application/json',
  }
};

export const httpConfig = {
    "baseURL" : import.meta.env['VITE_API_BASE_URL'],
    "timeout": 10000,
    "withCredentials": false,
    "headers": {
        'Content-Type': 'application/json',
    }
}