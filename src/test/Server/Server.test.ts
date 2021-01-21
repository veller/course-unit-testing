import { Authorizer } from '../../app/Authorization/Authorizer'
import { LoginHandler } from '../../app/Handlers/LoginHandler'
import { DataHandler } from '../../app/Handlers/DataHandler'
import { Server } from '../../app/Server/Server'
import { UsersDBAccess } from '../../app/Data/UsersDBAccess'

jest.mock('../../app/Handlers/LoginHandler')
jest.mock('../../app/Handlers/DataHandler')
jest.mock('../../app/Authorization/Authorizer')

const mockRequest = {
    url: ''
}
const mockResponse = {
    end: jest.fn()
}
const mockListen = {
    listen: jest.fn()
}

jest.mock('http', () => {
    return {
        createServer: (cb: any) => {
            cb(mockRequest, mockResponse)
            return mockListen
        }
    }
})

describe('Server test suite', () => {
    test('should create server and list on port 8080', () => {
        new Server().startServer()

        expect(mockResponse.end).toBeCalled()
        expect(mockListen.listen).toBeCalledWith(8080)
    })

    test('should handle login requests', () => {
        mockRequest.url = 'https://localhost:8080/login'
        new Server().startServer()
        const spyHandleRequest = jest.spyOn(LoginHandler.prototype, 'handleRequest')

        expect(spyHandleRequest).toBeCalled()
        expect(LoginHandler).toBeCalledWith(mockRequest, mockResponse, expect.any(Authorizer))
    })

    test('should handle data requests', () => {
        mockRequest.url = 'https://localhost:8080/users'
        new Server().startServer()
        const spyDataRequest = jest.spyOn(DataHandler.prototype, 'handleRequest')

        expect(spyDataRequest).toBeCalled()
        expect(DataHandler).toBeCalledWith(
            mockRequest,
            mockResponse,
            expect.any(Authorizer),
            expect.any(UsersDBAccess)
        )
    })
})
