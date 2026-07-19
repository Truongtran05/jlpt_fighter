const baseURL = import.meta.env['VITE_API_BASE_URL']

export const DictionaryEndPoints = {
    "kanjiSearch" : `${baseURL}/kanji/`,
    "vocabSearch" : `${baseURL}/vocab/`,
    "grammarSearch" : `${baseURL}/grammar/`,
    "suggestions" : `${baseURL}/suggestions/`,
}

