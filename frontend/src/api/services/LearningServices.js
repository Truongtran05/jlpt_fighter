import {AuthApiClient} from "../clients/AuthApiClient"
import {LearningEndPoints} from "../endpoints/LearningEndpoints"

export function getFlashCardSets(userId){
    return AuthApiClient.get(LearningEndPoints.flashCardSets(userId))
}

export function createFlashCardSet(userId, setData){
    return AuthApiClient.post(LearningEndPoints.flashCardSets(userId), setData)
}

export function getFlashCardSetDetails(setId){
    return AuthApiClient.get(LearningEndPoints.flashCardSetDetails(setId))
}

export function updateFlashCardSet(setId, setData){
    return AuthApiClient.patch(LearningEndPoints.flashCardSetDetails(setId), setData)
}

export function deleteFlashCardSet(setId){
    return AuthApiClient.delete(LearningEndPoints.flashCardSetDetails(setId))
}

export function createFlashCard(setId, cardData){
    return AuthApiClient.post(LearningEndPoints.flashCardSetCards(setId), cardData)
}

export function updateFlashCard(cardId, cardData){
    return AuthApiClient.patch(LearningEndPoints.flashCardDetails(cardId), cardData)
}

export function deleteFlashCard(cardId){
    return AuthApiClient.delete(LearningEndPoints.flashCardDetails(cardId))
}

export function updateFlashCardStatus(cardId, statusData){
    return AuthApiClient.patch(LearningEndPoints.flashCardStatusUpdate(cardId), statusData)
}