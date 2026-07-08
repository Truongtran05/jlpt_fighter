// frontend/src/hooks/useSuggestions.js
import { useEffect, useState } from "react";
import ApiClient from "../api/ApiClient.js";

export default function useSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      return;
    }

    const timer = setTimeout(() => {
      ApiClient.get(`/suggestions/?q=${encodeURIComponent(value)}`)
        .then((response) => setSuggestions(response.data.suggestions ?? []))
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return query.trim() ? suggestions : [];
}
