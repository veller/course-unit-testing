import { DataHandler } from "../../app/Handlers/DataHandler"
import { HTTP_CODES, HTTP_METHODS, TokenState } from "../../app/Models/ServerModels"
import { User, WorkingPosition } from "../../app/Models/UserModels"
import { Utils } from "../../app/Utils/Utils"

const someUsers: User[] = [{
    age: 123,
    email: 'some@email.com',
    id: '1234',
    name: 'Some Name',
    workingPosition: WorkingPosition.PROGRAMMER
}]

describe('DataHandler test suite', () => {
    const mockRequest = {
        method: '',
        headers: { authorization: '' }
    }
    const mockResponse = {
        writeHead: jest.fn(),
        write: jest.fn(),
        statusCode: 0
    }
    const mockTokenValidator = { validateToken: jest.fn() }
    const mockUsersDBAccess = { getUsersByName: jest.fn() }
    const mockParseUrl = jest.fn()
    let dataHandler: DataHandler

    beforeEach(() => {
        dataHandler = new DataHandler(
            mockRequest as any,
            mockResponse as any,
            mockTokenValidator as any,
            mockUsersDBAccess as any
        )
        Utils.parseUrl = mockParseUrl
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('options request', async () => {
        mockRequest.method = HTTP_METHODS.OPTIONS
        await dataHandler.handleRequest()

        expect(mockResponse.writeHead).toBeCalledWith(HTTP_CODES.OK)
    })

    test('not handled http method', async () => {
        mockRequest.method = 'someRandomMethod'
        await dataHandler.handleRequest()

        expect(mockResponse.writeHead).not.toHaveBeenCalled()
    })

    test('handle get request with operation authorized', async () => {
        mockRequest.method = HTTP_METHODS.GET
        mockRequest.headers.authorization = 'someTokenId'
        mockTokenValidator.validateToken.mockReturnValueOnce({
            accessRights: [1, 2, 3],
            state: TokenState.VALID
        })
        mockParseUrl.mockReturnValueOnce({
            query: {
                name: 'abcd'
            }
        })
        mockUsersDBAccess.getUsersByName.mockReturnValueOnce(someUsers)

        await dataHandler.handleRequest()

        expect(mockUsersDBAccess.getUsersByName).toBeCalledWith('abcd')
        expect(mockResponse.writeHead).toBeCalledWith(HTTP_CODES.OK, { 'Content-Type': 'application/json' })
        expect(mockResponse.write).toBeCalledWith(JSON.stringify(someUsers))
    })

    test('handle get request with operation unauthorized', async () => {
        mockRequest.method = HTTP_METHODS.GET
        mockRequest.headers.authorization = 'someTokenId'
        mockTokenValidator.validateToken.mockReturnValueOnce({
            accessRights: [2, 3],
            state: TokenState.VALID
        })

        await dataHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.UNAUTHORIZED)
        expect(mockResponse.write).toBeCalledWith('Unauthorized operation!')
    })

    test('handle get request with no authorization header', async () => {
        mockRequest.method = HTTP_METHODS.GET
        mockRequest.headers.authorization = ''

        await dataHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.UNAUTHORIZED)
        expect(mockResponse.write).toBeCalledWith('Unauthorized operation!')
    })

    test('handle get request with no name query', async () => {
        mockRequest.method = HTTP_METHODS.GET
        mockRequest.headers.authorization = 'someTokenId'
        mockTokenValidator.validateToken.mockReturnValueOnce({
            accessRights: [1, 2, 3],
            state: TokenState.VALID
        })
        mockParseUrl.mockReturnValueOnce({
            query: {}
        })

        await dataHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
        expect(mockResponse.write).toBeCalledWith('Missing name parameter in the request!')
    })

    test('handle get request with unexpected error', async () => {
        mockRequest.method = HTTP_METHODS.GET
        mockRequest.headers.authorization = 'someTokenId'
        mockTokenValidator.validateToken.mockRejectedValue(new Error('something went wrong!'))

        await dataHandler.handleRequest()

        expect(mockResponse.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR)
        expect(mockResponse.write).toBeCalledWith('Internal error: ' + 'something went wrong!')
    })

    test('handle not recognized http method', async () => {
        mockRequest.method = 'someMethod'

        await dataHandler.handleRequest()

        expect(mockResponse.write).not.toHaveBeenCalled()
        expect(mockResponse.writeHead).not.toHaveBeenCalled()
    })


})
