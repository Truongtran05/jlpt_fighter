import {clearAuthSession} from "../../utils/AuthStorage"
import {createRefreshManager} from "../core/RefreshManager"
import {AuthEndPoints} from "../endpoints/AuthEndpoints"
import {ClientFactory} from "../core/HttpClientFactory"
import {attachAuthInterceptor} from "../core/AuthInterceptor"

const AuthApiClient = ClientFactory(true)
const refreshClient = ClientFactory(true)

const refreshToken = async () => {
  try{
    const refreshURL = AuthEndPoints.refreshToken
    await refreshClient.post(refreshURL, {})
  } catch (error) {
    throw error
  }
}

const {refreshOrWait} = createRefreshManager({refreshFn: refreshToken, onRefreshFail: clearAuthSession})

attachAuthInterceptor(AuthApiClient, {refreshOrWait, onAuthFail: clearAuthSession})

export default AuthApiClient