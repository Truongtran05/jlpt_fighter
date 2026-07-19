import ApiClient from "../clients/ApiClient"
import {AuthEndPoints} from "../endpoints/AuthEndpoints"

export function loginUser(credentials){
    return ApiClient.post(AuthEndPoints.login, credentials)
}

export function logoutUser(){
    return ApiClient.post(AuthEndPoints.logout)
}

export function registerUser(userData){
    return ApiClient.post(AuthEndPoints.register, userData)
}
