import { useCallback, useState } from "react";
import {searchKanji , searchGrammar, searchVocabulary} from "../api/services/DictionaryServices"
import {errorMapper} from "../api/core/ErrorMapper"

export default function useSearch(searchContext) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const { type, page, pageSize } = searchContext;

  const search = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);


    try {
      let apiResponse;
      if (type === 'kanji') {
        apiResponse = await searchKanji({
          q: query,
          page,
          page_size: pageSize,
        });
      } else if (type === 'vocab') {
        apiResponse = await searchVocabulary({
          q: query,
          page,
          page_size: pageSize,
        });
      } else if (type === 'grammar') {
        apiResponse = await searchGrammar({
          q: query,
          page,
          page_size: pageSize,
        });
      }
      setResponse(apiResponse.data);
    } 
    catch (err) {
      setError(errorMapper(err));
    }
    finally {
      setIsLoading(false);
    }
  }, [type, page, pageSize]);

  return [response, isLoading, search, error];
}
