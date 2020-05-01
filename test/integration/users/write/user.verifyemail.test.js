import { apiResolver } from 'next/dist/next-server/server/api-utils'
import fetch from 'isomorphic-unfetch'
import { findUser } from '../../../../lib/api/users/user'
import handlerAuth from '../../../../pages/api/auth/[action]'
import http from 'http'
import listen from 'test-listen'

jest.mock('../../../../lib/api/users/user')
jest.mock('../../../../empieza.config', () => ({
  __esModule: true,
  getConfig: jest.fn().mockReturnValue({
      title: 'A test',
      description: 'A test',
      user: {
        emailVerification: true
      }
  })
}))

const newUser = {
  username: 'emilio',
  email: 'email@email.com',
  password: 'test123123',
}

describe('Integration tests for email verification with emailVerification enabled', () => {
   
  let serverAuth
  let urlAuth
  let urlLogin

  beforeAll(async (done) => {
    
    serverAuth = http.createServer((req, res) =>
      apiResolver(req, res, undefined, handlerAuth)
    )

    urlAuth = await listen(serverAuth)
    urlLogin = urlAuth + '/api/auth/login'
    done()
  })

  afterAll((done) => {
    serverAuth.close(done)
  })

  afterEach(() => {
    findUser.mockClear()
  })

  test('Should return 401 for a user with unverified email if configuration for verification is enabled', async () => {
    findUser.mockReturnValueOnce(Promise.resolve({
      ...newUser,
      emailVerified: false
    }))

  
    const response = await fetch(urlLogin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: newUser.email,
        password: newUser.password,
      }),
    })

    expect(response.status).toBe(401)
    const jsonResult = await response.json()

    expect(jsonResult).toMatchObject({
      error: 'Email not verified',
    })
  })

})