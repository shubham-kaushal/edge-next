import {
  findOneContent,
  updateOneContent,
} from '../../../../../lib/api/entities/content/content'

import { findOneUser } from '../../../../../lib/api/entities/users/user'

import { apiResolver } from 'next/dist/next-server/server/api-utils'
import fetch from 'isomorphic-unfetch'
import { getSession } from '../../../../../lib/api/auth/iron'
import handler from '../../../../../pages/api/groups/[type]/[slug]/users/[userId]'
import http from 'http'
import listen from 'test-listen'
import getPermissions from '../../../../../lib/permissions/get-permissions'

jest.mock('../../../../../lib/api/auth/iron')
jest.mock('../../../../../lib/permissions/get-permissions')
jest.mock('../../../../../lib/api/entities/content/content')
jest.mock('../../../../../lib/api/entities/users/user')
jest.mock('../../../../../lib/api/storage')

jest.mock('../../../../../edge.config', () => {
  const groupType = 'project'
  const mockGroupType = {
    title: 'Project',

    slug: groupType,

    slugGeneration: ['title', 'createdAt'],

    publishing: {
      draftMode: true,
    },

    permissions: {
      read: ['PUBLIC'],
      create: ['ADMIN', 'USER'],
      update: ['ADMIN'],
      delete: ['ADMIN'],
      admin: ['ADMIN'],
    },

    roles: [
      {
        label: 'Group Member',
        value: 'GROUP_MEMBER',
      },
      {
        label: 'Group admin',
        value: 'GROUP_ADMIN',
      },
    ],

    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Title',
        title: true,
        minlength: 2,
        placeholder: 'Title',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Description',
      },
      {
        name: 'images',
        multiple: true,
        type: 'img',
        label: 'Image',
        placeholder: 'Image',
      },
    ],

    user: {
      requireApproval: true,
      permissions: {
        join: ['USER'],
        update: ['ADMIN'],
        create: ['ADMIN'],
      },
    },
  }

  return {
    __esModule: true,
    getConfig: jest.fn().mockReturnValue({
      title: 'A test',
      description: 'A test',

      groups: {
        types: [mockGroupType],
      },

      user: {
        permissions: {},

        roles: [{ label: 'user', value: 'USER' }],
        newUserRoles: ['USER'],
      },
    }),
  }
})

describe('Integrations tests for group user update', () => {
  const groupType = 'project'
  const groupSlug = 'group-1'
  let urlToBeUsed = ''
  let server
  let url

  beforeAll(async (done) => {
    server = http.createServer((req, res) =>
      apiResolver(req, res, undefined, handler)
    )
    url = await listen(server)

    done()
  })

  afterAll((done) => {
    server.close(done)
  })

  beforeEach(() => {
    urlToBeUsed = new URL(url)
    const userParams = { type: groupType, slug: groupSlug }

    Object.keys(userParams).forEach((key) =>
      urlToBeUsed.searchParams.append(key, userParams[key])
    )

    // group to user has to be added to
    findOneContent.mockReturnValue(
      Promise.resolve({
        slug: groupSlug,
        id: groupSlug,
        members: [
          { id: 'user2', roles: ['GROUP_MEMBER'] },
          { id: 'user3', roles: ['GROUP_ADMIN'] },
        ],
        pendingMembers: [
          { id: 'user4', roles: ['GROUP_MEMBER'] },
          { id: 'user5', roles: ['GROUP_MEMBER'] },
        ],
      })
    )

    // user for event
    findOneUser.mockReturnValue(
      Promise.resolve({
        email: 'test@test.test',
      })
    )

    getPermissions.mockReturnValue({
      [`group.${groupType}.user.join`]: ['USER'],
      [`group.${groupType}.user.update`]: ['GROUP_ADMIN'],
      [`group.${groupType}.admin`]: ['ADMIN'],
    })
  })

  afterEach(() => {
    updateOneContent.mockReset()
    findOneContent.mockReset()
    getPermissions.mockReset()
    getSession.mockReset()
    findOneUser.mockReset()
  })

  async function fetchQuery(body, userId, action = '') {
    const userParams = { userId, action }

    Object.keys(userParams).forEach((key) =>
      urlToBeUsed.searchParams.append(key, userParams[key])
    )

    return fetch(urlToBeUsed.href, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  test('User with group admin role approves member 4', async () => {
    updateOneContent.mockReturnValue(
      Promise.resolve({
        slug: groupSlug,
        id: groupSlug,
        pendingMembers: [{ id: 'user5', roles: ['GROUP_MEMBER'] }],
      })
    )

    getSession.mockReturnValueOnce({
      roles: ['GROUP_ADMIN'],
      id: 'user1',
    })

    const memberBody = {
      id: 'user4',
      roles: ['GROUP_MEMBER'],
    }

    const response = await fetchQuery(memberBody, 'user4', 'approve')

    expect(response.status).toEqual(200)
    expect(updateOneContent).toHaveBeenCalledWith(groupType, groupSlug, {
      pendingMembers: [{ id: 'user5', roles: ['GROUP_MEMBER'] }],
      members: [
        { id: 'user4', roles: ['GROUP_MEMBER'] },
        { id: 'user2', roles: ['GROUP_MEMBER'] },
        { id: 'user3', roles: ['GROUP_ADMIN'] },
      ],
    })
  })

  test('User with group admin role approves member 5', async () => {
    updateOneContent.mockReturnValue(
      Promise.resolve({
        slug: groupSlug,
        id: groupSlug,
        pendingMembers: [{ id: 'user4', roles: ['GROUP_MEMBER'] }],
      })
    )

    getSession.mockReturnValueOnce({
      roles: ['GROUP_ADMIN'],
      id: 'user1',
    })

    const memberBody = {
      id: 'user5',
      roles: ['GROUP_ADMIN'],
    }

    const response = await fetchQuery(memberBody, 'user5', 'approve')

    expect(response.status).toEqual(200)
    expect(updateOneContent).toHaveBeenCalledWith(groupType, groupSlug, {
      pendingMembers: [{ id: 'user4', roles: ['GROUP_MEMBER'] }],
      members: [
        { id: 'user5', roles: ['GROUP_ADMIN'] },
        { id: 'user2', roles: ['GROUP_MEMBER'] },
        { id: 'user3', roles: ['GROUP_ADMIN'] },
      ],
    })
  })

  test('User without permitted role cant approve member', async () => {
    getSession.mockReturnValueOnce({
      roles: ['PUBLIC'],
      id: 'user1',
    })

    const memberBody = {
      id: 'user4',
      roles: ['GROUP_MEMBER'],
    }

    const response = await fetchQuery(memberBody, 'user4', 'approve')

    expect(response.status).toEqual(401)
    expect(updateOneContent).not.toHaveBeenCalled()
  })

  test('User with group admin role add member', async () => {
    updateOneContent.mockReturnValue(
      Promise.resolve({
        slug: groupSlug,
        id: groupSlug,
        members: [
          { id: 'user2', roles: ['GROUP_MEMBER'] },
          { id: 'user3', roles: ['GROUP_ADMIN'] },
          { id: 'user6', roles: ['GROUP_ADMIN'] },
        ],
      })
    )

    getSession.mockReturnValueOnce({
      roles: ['GROUP_ADMIN'],
      id: 'user1',
    })

    const memberBody = {
      id: 'user6',
      roles: ['GROUP_ADMIN'],
    }

    const response = await fetchQuery(memberBody, 'user6')

    expect(response.status).toEqual(200)
    expect(updateOneContent).toHaveBeenCalledWith(groupType, groupSlug, {
      members: [
        { id: 'user6', roles: ['GROUP_ADMIN'] },
        { id: 'user2', roles: ['GROUP_MEMBER'] },
        { id: 'user3', roles: ['GROUP_ADMIN'] },
      ],
    })
  })
})
