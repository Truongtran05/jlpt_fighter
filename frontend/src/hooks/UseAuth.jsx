import {useState, useCallback} from 'react'
import {loginUser,registerUser} from '../api/services/AuthServices'

export default function useAuth(prefix) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const auth = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try{
        let apiResponse;
        if(prefix === 'login'){
            apiResponse = await loginUser(data)
        } else if(prefix === 'register'){
            apiResponse = await registerUser(data)
        }
        setResponse(apiResponse.data);
        return apiResponse.data;
    }catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Authentication failed."
      setError(message)
      throw err
    }
    finally{
      setIsLoading(false);
    }
    }, [prefix]);

    return [response, isLoading, auth, error];
}



