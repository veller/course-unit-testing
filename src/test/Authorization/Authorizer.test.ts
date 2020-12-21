import { Authorizer } from '../../app/Authorization/Authorizer'
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess'
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess'
import { Account, SessionToken, TokenState } from '../../app/Models/ServerModels'
jest.mock('../../app/Authorization/SessionTokenDBAccess')
jest.mock('../../app/Authorization/UserCredentialsDbAccess')

describe('Authorizer test suite', () => {
    const mockSessionTokenDBAccess = {
        storeSessionToken: jest.fn(),
        getToken: jest.fn()
    }
    const mockUserCredentialsDbAccess = {
        getUserCredential: jest.fn()
    }
    const someAccount: Account = {
        username: 'someUser',
        password: 'password'
    }
    let authorizer: Authorizer

    beforeEach(() => {
        authorizer = new Authorizer(
            mockSessionTokenDBAccess as any,
            mockUserCredentialsDbAccess as any
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('constructor argument', () => {
        new Authorizer()

        expect(SessionTokenDBAccess).toBeCalled()
        expect(UserCredentialsDbAccess).toBeCalled()
    })

    test('should return sessionToken for valid credentials', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValueOnce(0)
        jest.spyOn(global.Date, 'now').mockReturnValueOnce(0)
        mockUserCredentialsDbAccess.getUserCredential.mockResolvedValueOnce({
            username: 'someUser',
            accessRights: [1, 2, 3]
        })
        const expectedSessionToken: SessionToken = {
            userName: 'someUser',
            accessRights: [1, 2, 3],
            valid: true,
            tokenId: '',
            expirationTime: new Date(60 * 60 * 1000)
        }
        const sessionToken = await authorizer.generateToken(someAccount)

        expect(expectedSessionToken).toEqual(sessionToken)
        expect(mockSessionTokenDBAccess.storeSessionToken).toBeCalledWith(sessionToken)
    })

    test('should return null if invalid credentials', async () => {
        mockUserCredentialsDbAccess.getUserCredential.mockReturnValue(null)

        const loginResult = await authorizer.generateToken(someAccount)

        expect(mockUserCredentialsDbAccess.getUserCredential).toBeCalledWith(someAccount.username, someAccount.password)
        expect(loginResult).toBeNull
    })

    test('validateToken returns invalid for null token', async () => {
        mockSessionTokenDBAccess.getToken.mockReturnValueOnce(null)

        const sessionToken = await authorizer.validateToken('123')

        expect(sessionToken).toStrictEqual({
            accessRights: [],
            state: TokenState.INVALID
        })
    })

    test('validateToken returns expired for expired tokens', async () => {
        const dateInPast = new Date(Date.now() - 1);
        mockSessionTokenDBAccess.getToken.mockReturnValueOnce({ valid: true, expirationTime: dateInPast })
    })


})
