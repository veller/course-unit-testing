import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
jest.mock('nedb');

describe('sessionTokenDBAccess', () => {
    let sessionTokenDBAccess: SessionTokenDBAccess

    const mockNedb = {
        loadDatabase: jest.fn(),
        insert: jest.fn(),
        find: jest.fn(),
        remove: jest.fn(),
    }

    const someToken = {
        tokenId: '123',
        userName: 'John',
        valid: true,
        expirationTime: new Date(),
        accessRights: []
    }

    const someTokenId = '123'

    beforeEach(() => {
        sessionTokenDBAccess = new SessionTokenDBAccess(mockNedb)
        expect(mockNedb.loadDatabase).toBeCalled()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('store sessionToken without error', async () => {
        mockNedb.insert.mockImplementationOnce((someToken: any, cb: any) => { cb() })
        await sessionTokenDBAccess.storeSessionToken(someToken)

        expect(mockNedb.insert).toBeCalledWith(someToken, expect.any(Function))
    })

    test('store sessionToken with error', async () => {
        mockNedb.insert.mockImplementationOnce((someToken: any, cb: any) => { cb(new Error('something went wrong')) })

        await expect(sessionTokenDBAccess.storeSessionToken(someToken)).rejects.toThrow('something went wrong')
        expect(mockNedb.insert).toBeCalledWith(someToken, expect.any(Function))
    })

    test('get token with result and no error', async () => {
        mockNedb.find.mockImplementationOnce((someTokenId: any, cb: any) => { cb(null, [someToken]) })
        await sessionTokenDBAccess.getToken(someTokenId)

        expect(mockNedb.find).toBeCalledWith({ tokenId: someTokenId }, expect.any(Function))
    })

    test('get token with no result and no error', async () => {
        mockNedb.find.mockImplementationOnce((someTokenId: any, cb: any) => { cb(null, []) })
        const result = await sessionTokenDBAccess.getToken(someTokenId)

        expect(result).toBeNull
        expect(mockNedb.find).toBeCalledWith({ tokenId: someTokenId }, expect.any(Function))
    })

    test('get token with error', async () => {
        mockNedb.find.mockImplementationOnce((someTokenId: any, cb: any) => { cb(new Error('something went wrong'), []) })

        await expect(sessionTokenDBAccess.getToken(someTokenId)).rejects.toThrow('something went wrong')
        expect(mockNedb.find).toBeCalledWith({ tokenId: someTokenId }, expect.any(Function))
    })

    test('delete token with no error', async () => {
        mockNedb.remove.mockImplementationOnce(({ tokenId: someTokenId }, { }, cb: any) => { cb(null, 123) })
        await sessionTokenDBAccess.deleteToken(someTokenId)

        expect(mockNedb.remove).toBeCalledWith({ tokenId: someTokenId }, {}, expect.any(Function))
    })

    test('delete token with no result', async () => {
        mockNedb.remove.mockImplementationOnce(({ tokenId: someTokenId }, { }, cb: any) => { cb(null, 0) })

        await expect(sessionTokenDBAccess.deleteToken(someTokenId)).rejects.toThrow('Session token not deleted')
        expect(mockNedb.remove).toBeCalledWith({ tokenId: someTokenId }, {}, expect.any(Function))
    })

    test('delete token with error', async () => {
        mockNedb.remove.mockImplementationOnce(({ tokenId: someTokenId }, { }, cb: any) => { cb(new Error('something went wrong'), 123) })

        await expect(sessionTokenDBAccess.deleteToken(someTokenId)).rejects.toThrow('something went wrong')
        expect(mockNedb.remove).toBeCalledWith({ tokenId: someTokenId }, {}, expect.any(Function))
    })
})
