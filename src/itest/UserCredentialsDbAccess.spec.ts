import { UserCredentialsDbAccess } from '../app/Authorization/UserCredentialsDbAccess'
import { UserCredentials } from '../app/Models/ServerModels'

describe('UserCredentialsDbAccess', () => {
    const randomString = Math.random().toString(36).substring(7);
    let userCredentialsDbAccess: UserCredentialsDbAccess
    let userCredentials: UserCredentials

    beforeAll(() => {
        userCredentialsDbAccess = new UserCredentialsDbAccess();

        userCredentials = {
            username: 'someUserName',
            password: 'somePassword',
            accessRights: [1, 2, 3]
        }
    })

    test('insert and find user credential', async () => {
        await userCredentialsDbAccess.putUserCredential(userCredentials)
        const result = await userCredentialsDbAccess.getUserCredential(userCredentials.username, userCredentials.password)

        expect(result).toMatchObject(userCredentials)
    })

    test('should delete UserCredentials', async () => {
        await userCredentialsDbAccess.deleteUserCredencials(userCredentials)
        const result = await userCredentialsDbAccess.getUserCredential(userCredentials.username, userCredentials.password)

        expect(result).toBeNull()
    })

    test('delete missing UserCredential throws error', async () => {
        try {
            await userCredentialsDbAccess.deleteUserCredencials(userCredentials)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error).toHaveProperty('message', 'User Credential not deleted')
        }
    })
})
