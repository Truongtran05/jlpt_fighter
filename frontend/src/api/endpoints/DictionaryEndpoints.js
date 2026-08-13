const baseURL = import.meta.env['VITE_API_BASE_URL']

export const DictionaryEndPoints = {
    "stats" : `${baseURL}/stats/`,
    "jlptKanji" : `${baseURL}/stats/kanji/`,
    "jlptVocab" : `${baseURL}/stats/vocab/`,
    "jlptGrammar" : `${baseURL}/stats/grammar/`,
    "relatedKanji" : `${baseURL}/related/kanji/`,
    "relatedVocab" : `${baseURL}/related/vocab/`,
    "kanjiSearch" : `${baseURL}/kanji/`,
    "vocabSearch" : `${baseURL}/vocab/`,
    "grammarSearch" : `${baseURL}/grammar/`,
    "suggestions" : `${baseURL}/suggestions/`,
}

