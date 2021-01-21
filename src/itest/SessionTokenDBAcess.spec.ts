import { SessionTokenDBAccess } from '../app/Authorization/SessionTokenDBAccess'
import { SessionToken } from '../app/Models/ServerModels'

describe('sessionTokenDBAcess', () => {
    const randomString = Math.random().toString(36).substring(7)
    let sessionTokenDBAccess: SessionTokenDBAccess
    let sessionToken: SessionToken

    beforeAll(() => {
        sessionTokenDBAccess = new SessionTokenDBAccess()
        sessionToken = {
            accessRights: [1, 2, 3],
            expirationTime: new Date(),
            tokenId: 'someTokenId' + randomString,
            userName: 'someUserName',
            valid: true
        }
    })

    test('store and retrieve session token', async () => {
        await sessionTokenDBAccess.storeSessionToken(sessionToken)
        const resultToken = await sessionTokenDBAccess.getToken(sessionToken.tokenId)

        expect(resultToken).toMatchObject(sessionToken)
    })

    test('delete sessionToken', async () => {
        await sessionTokenDBAccess.deleteToken(sessionToken.tokenId)
        const resultToken = await sessionTokenDBAccess.getToken(sessionToken.tokenId)

        expect(resultToken).toBeUndefined()
    })

    test('delete missing sessionToken throws error', async () => {
        try {
            await sessionTokenDBAccess.deleteToken(sessionToken.tokenId)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error).toHaveProperty('message', 'Session token not deleted')
        }
    })
})