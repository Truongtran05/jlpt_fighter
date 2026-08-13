const baseURL = import.meta.env['VITE_API_BASE_URL']

export const LearningEndPoints = {
    "flashCardSets" : `${baseURL}/flashcard-sets/`,
    "flashCardSetDetails" : (setId) => `${baseURL}/flashcard-sets/${setId}/`,
    "flashCardSetCards" : (setId) => `${baseURL}/flashcard-sets/${setId}/flashcards/`,
    "flashCardDetails" : (cardId) => `${baseURL}/flashcards/${cardId}/`,
    "flashCardStatusUpdate" : (cardId) => `${baseURL}/flashcards/${cardId}/status/`,
}
