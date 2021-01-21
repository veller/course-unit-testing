import * as axios from 'axios'
import { HTTP_CODES, SessionToken, UserCredentials } from '../app/Models/ServerModels'
import { UserCredentialsDbAccess } from '../app/Authorization/UserCredentialsDbAccess'

axios.default.defaults.validateStatus = function () { return true }
const serverUrl = 'http://localhost:8080'
const userCredentials: UserCredentials = {
    accessRights: [1, 2, 3],
    password: 'itestPassword',
    username: 'itestUsername'
}

describe('server itest suite', () => {
    let userCredentialsDbAccess: UserCredentialsDbAccess
    let sessionToken: SessionToken

    beforeAll(() => {
        userCredentialsDbAccess = new UserCredentialsDbAccess()
    })

    test('server reachable', async () => {
        const response = await axios.default.options(serverUrl)

        expect(response.status).toBe(HTTP_CODES.OK)
    })

    test.skip('put credentials inside database', async () => {
        await userCredentialsDbAccess.putUserCredential(userCredentials)
    })

    test('reject invalid credentials', async () => {
        const response = await axios.default.post(
            `${serverUrl}/login`,
            {
                'username': 'wrongUsername',
                'password': 'wrongPassword'
            }
        )

        expect(response.status).toBe(HTTP_CODES.NOT_fOUND)
    })

    test('login successfully with correct credentials', async () => {
        const response = await axios.default.post(
            `${serverUrl}/login`,
            {
                'username': userCredentials.username,
                'password': userCredentials.password
            }
        )

        expect(response.status).toBe(HTTP_CODES.CREATED)
        sessionToken = response.data
    })

    test('query data', async () => {
        const response = await axios.default.get(
            `${serverUrl}/users?name=itestUsername`,
            { headers: { Authorization: sessionToken.tokenId } }
        )

        expect(response.status).toBe(HTTP_CODES.OK)
    })

    test('invalid token', async () => {
        const response = await axios.default.get(
            `${serverUrl}/users?name=itestUsername`,
            { headers: { Authorization: `wrongToken` } }
        )

        expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED)
    })
})

/* 
not usable in Jest
*/
async function serverReachable(): Promise<boolean> {
    try {
        await axios.default.get(serverUrl)
    } catch (error) {
        console.log('server NOT reachable')
        return false
    }
    console.log('server reachable')
    return true
}