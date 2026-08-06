import { useCallback, useState } from "react";
import {searchKanji , searchGrammar, searchVocabulary} from "../api/services/DictionaryServices"
import {errorMapper} from "../api/core/ErrorMapper"
import { useLanguage } from "../contexts/LanguageContext.jsx"

export default function useSearch(searchContext) {
  const { language } = useLanguage();
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
          lang: language,
        });
      } else if (type === 'vocab') {
        apiResponse = await searchVocabulary({
          q: query,
          page,
          page_size: pageSize,
          lang: language,
        });
      } else if (type === 'grammar') {
        apiResponse = await searchGrammar({
          q: query,
          page,
          page_size: pageSize,
          lang: language,
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
  }, [type, page, pageSize, language]);

  return [response, isLoading, search, error];
}
