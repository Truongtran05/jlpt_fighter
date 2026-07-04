import ApiClient from '../api/ApiClient'
import { useCallback, useState } from "react";

export default function useSearch(searchContext) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const { type, page, pageSize } = searchContext;

  const search = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);


    try {
      const apiResponse = await ApiClient.get(`/${type}/`, {
        params: {
          q: query,
          page,
          page_size: pageSize,
        },
      });

      setResponse(apiResponse.data);
    } 
    catch (err) {
      setError('An error occurred while searching. Please try again later.');
    }
    finally {
      setIsLoading(false);
    }
  }, [type, page, pageSize]);

  return [response, isLoading, search, error];
}
