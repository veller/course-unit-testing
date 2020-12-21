import { LoginHandler } from "../../app/Handlers/LoginHandler"
import { HTTP_CODES, HTTP_METHODS, SessionToken } from "../../app/Models/ServerModels"
import { Utils } from '../../app/Utils/Utils'

describe('LoginHandler test suite', () => {
    const mockRequest = {
        method: ''
    }
    const mockResponse = {
        writeHead: jest.fn(),
        write: jest.fn(),
        statusCode: 0
    }
    const mockAuthorizer = {
        generateToken: jest.fn()
    }
    const mockGetRequestBody = jest.fn()
    const someSessionToken: SessionToken = {
        tokenId: 'someTokenId',
        userName: 'someUserName',
        valid: true,
        expirationTime: new Date(),
        accessRights: [1, 2, 3]
    }
    let loginHandler: LoginHandler

    beforeEach(() => {
        loginHandler = new LoginHandler(
            mockRequest as any,
            mockResponse as any,
            mockAuthorizer as any
        )
        Utils.getRequestBody = mockGetRequestBody
        mockRequest.method = HTTP_METHODS.POST
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('options request', async () => {
        mockRequest.method = HTTP_METHODS.OPTIONS
        await loginHandler.handleRequest()

        expect(mockResponse.writeHead).toBeCalledWith(HTTP_CODES.OK)
    })

    test('not handled http method', async () => {
        mockRequest.method = 'someRandomMethod'
        await loginHandler.handleRequest()

        expect(mockResponse.writeHead).not.toHaveBeenCalled()
    })

    test('post request with valid login', async () => {
        mockGetRequestBody.mockReturnValueOnce({
            username: 'someUser',
            password: 'somePassword'
        })
        mockAuthorizer.generateToken.mockReturnValueOnce(someSessionToken)
        await loginHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.CREATED)
        expect(mockResponse.writeHead).toBeCalledWith(HTTP_CODES.CREATED, { 'Content-Type': 'application/json' })
        expect(mockResponse.write).toBeCalledWith(JSON.stringify(someSessionToken))
    })

    test('post request with invalid login', async () => {
        mockGetRequestBody.mockReturnValueOnce({
            username: 'someUser',
            password: 'somePassword'
        })
        mockAuthorizer.generateToken.mockReturnValueOnce(null)
        await loginHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.NOT_fOUND)
        expect(mockResponse.write).toBeCalledWith('wrong username or password')
    })

    test('post request with unexpected error', async () => {
        mockGetRequestBody.mockRejectedValueOnce(new Error('something went wrong'))
        await loginHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR)
        expect(mockResponse.write).toBeCalledWith('Internal error: something went wrong')
    })

})
