import ApiClient from "../clients/ApiClient"
import {DictionaryEndPoints} from "../endpoints/DictionaryEndpoints"

export function getDictionaryStats(){
    return ApiClient.get(DictionaryEndPoints.stats)
}

export function getRelatedKanji(query){
    return ApiClient.get(DictionaryEndPoints.relatedKanji, { params: query })
}

export function getRelatedVocab(query){
    return ApiClient.get(DictionaryEndPoints.relatedVocab, { params: query })
}

export function searchKanji(query){
    return ApiClient.get(DictionaryEndPoints.kanjiSearch, { params:  query })
}

export function searchVocabulary(query){
    return ApiClient.get(DictionaryEndPoints.vocabSearch, { params:  query  })
}

export function searchGrammar(query){
    return ApiClient.get(DictionaryEndPoints.grammarSearch, { params:  query  })
}

export function getSuggestions(query){
    return ApiClient.get(DictionaryEndPoints.suggestions, { params:  query  })
}
