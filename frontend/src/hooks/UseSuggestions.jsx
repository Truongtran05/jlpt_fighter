// frontend/src/hooks/useSuggestions.js
import { useEffect, useState } from "react";
import {getSuggestions} from "../api/services/DictionaryServices"
import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function useSuggestions(query) {
  const { language } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      return;
    }

    const timer = setTimeout(() => {
      getSuggestions({ q: value, lang: language })
        .then((suggestions) => setSuggestions(suggestions.data.suggestions))
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, language]);

  return query.trim() ? suggestions : [];
}
