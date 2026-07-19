const baseURL = import.meta.env['VITE_API_BASE_URL']

export const LearningEndPoints = {
    "flashCardSets" : `${baseURL}/flash-card-sets/`,
    "flashCardSetDetails" : (setId) => `${baseURL}/flash-card-sets/${setId}/`,
    "flashCardSetCards" : (setId) => `${baseURL}/flash-card-sets/${setId}/flashcards/`,
    "flashCardDetails" : (cardId) => `${baseURL}/flashcards/${cardId}/`,
    "flashCardStatusUpdate" : (cardId) => `${baseURL}/flashcards/${cardId}/status/`,
}