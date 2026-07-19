// frontend/src/hooks/useSuggestions.js
import { useEffect, useState } from "react";
import {getSuggestions} from "../api/services/DictionaryServices"

export default function useSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      return;
    }

    const timer = setTimeout(() => {
      getSuggestions({ q: value })
        .then((suggestions) => setSuggestions(suggestions.data.suggestions))
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return query.trim() ? suggestions : [];
}
