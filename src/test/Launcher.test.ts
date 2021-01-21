import { mocked } from 'ts-jest'
import { Launcher } from '../app/Launcher'
import { Server } from '../app/Server/Server'

jest.mock('../app/Server/Server', () => {
    return {
        Server: jest.fn(() => {
            return {
                startServer: () => {
                    console.log('starting the server')
                }
            }
        })
    }
})

describe('Launcher test suite', () => {
    const mockedServer = mocked(Server, true)

    test('create server', () => {
        new Launcher()
        expect(mockedServer).toBeCalled()
    })

    test('launch app', () => {
        const mockLaunchApp = jest.fn()
        Launcher.prototype.launchApp = mockLaunchApp
        new Launcher().launchApp()

        expect(mockLaunchApp).toBeCalled()
    })
})
