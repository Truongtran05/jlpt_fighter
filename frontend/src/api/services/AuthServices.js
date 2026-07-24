import ApiClient from "../clients/ApiClient"
import AuthApiClient from "../clients/AuthApiClient"
import {AuthEndPoints} from "../endpoints/AuthEndpoints"

export function loginUser(credentials){
    return AuthApiClient.post(AuthEndPoints.login, credentials)
}

export function logoutUser(){
    return AuthApiClient.post(AuthEndPoints.logout)
}

export function registerUser(userData){
    return AuthApiClient.post(AuthEndPoints.register, userData)
}
