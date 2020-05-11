import { deleteFile, uploadFile } from '../../../lib/api/storage'
import { findOneUser, generateSaltAndHash, updateOneUser, userPasswordsMatch } from '../../../lib/api/users/user'
import { onUserDeleted, onUserUpdated } from '../../../lib/api/hooks/user.hooks'

import { connect } from '../../../lib/api/db'
import formidable from 'formidable';
import { getSession } from '../../../lib/api/auth/iron'
import { hasPermissionsForUser } from '../../../lib/api/middlewares'
import methods from '../../../lib/api/api-helpers/methods'
import runMiddleware from '../../../lib/api/api-helpers/run-middleware'
import { v4 as uuidv4 } from 'uuid'

// disable the default body parser to be able to use file upload
export const config = {
  api: {
    bodyParser: false,
  }
}

const useFormidable = (cb) => (req, res) => {
  
  const form = formidable({ multiples: true });
  
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({error: err.message})
    }
    req.body = fields
    req.files = files
    cb(req, res)
  });

}

const userExist = (userId) => async (req, res, cb) => {
  let findUserId = userId

  if (userId === 'me') {
    const session = await getSession(req)

    if (!session) {
      cb(new Error('User not found'))
      return
    }

    findUserId = session.id
  }

  const user = await findOneUser({ id: findUserId })

  if (!user) {
    cb(new Error('User not found'))
  } else {
    req.user = user
    cb()
  }
}

const getUser = (req, res) => {
  // TODO: Hide private fields
  res.status(200).json(req.user)
}

const delUser = (req, res) => {
  // TODO: implement
  onUserDeleted(req.user)
  res.status(200).send({
    deleted: true,
  })
}

function updateProfile(userId, profile ) {
  return updateOneUser(userId, {
    profile,
  })
}

function updateUsername(userId, username) {
  return findOneUser({ username }).then(
    (maybeUser) => {
      if (!maybeUser) {
        return updateOneUser(userId, { username })
      } else {
        throw new Error('Username already exists')
      }
    }
  )
}

function updateEmail(userId, email) {
  return findOneUser({ email: email }).then(
    (maybeUser) => {
      if (!maybeUser) {
        return updateOneUser(userId, {
          email: email,
          emailVerificationToken: uuidv4(),
        })
      } else {
        throw new Error('email already exists')
      }
    }
  )
}

function updateBlockedStatus(userId, blocked) {
  return updateOneUser(userId, {
    blocked,
  })
}

function updatePassword(user, password, newpassword) {
  const passwordsMatch = user.hash ? userPasswordsMatch(user, password) : true
  if (passwordsMatch ) {
    const { salt, hash } = generateSaltAndHash(newpassword) 
    return updateOneUser(user.id, {
      salt,
      hash
    })
  } else {
    return Promise.reject('Incorrect password')
  }
}


function updateProfilePicture(user, profilePicture) {
  return new Promise( async (resolve, reject) => {
          
      let path = ''

      // upload the new file
      try {
        path = await uploadFile(profilePicture, 'profilePicture')
      } catch (err) {
        reject(new Error('Error uploading file'))
        return
      }

      // Delete previous file
      if (user.profile.picture) {
        try {
          await deleteFile(user.profile.picture)
        } catch (err) {
          console.log('Error deleting previous picture')
        }
      }

      // Asign the new path
      updateOneUser(user.id, {
        profile: {
          ...user.profile,
          picture: path
        },
      })
      .then(resolve)
      .catch(reject)
  })
}

const updateUser = (slug) => (req, res) => {
  
  const updateData = slug[1]

  let promiseChange = null

  switch (updateData) {
    case 'profile':
      /* Update only profile data */
      promiseChange = updateProfile(req.user.id, {
        ...req.user.profile,
        ...req.body,
      })
      break
    case 'username':
      /* Update only username */
      promiseChange = updateUsername(req.user.id, req.body.username)
      break
    case 'email':
      /* Update only email */
      promiseChange = updateEmail(req.user.id, req.body.email)
      break

    case 'block':
      /* Update only blocked status */
      promiseChange = updateBlockedStatus(req.user.id, req.body.blocked)
      break

    case 'password':
      /* Update only password */
      // Check that the current password req.req.body.password matches the old one
      promiseChange = updatePassword(req.user, req.body.password, req.body.newpassword)
      break
    
    case 'picture': 
      
      promiseChange = updateProfilePicture(req.user, req.files.profilePicture)

      break
    default:
      promiseChange = Promise.reject('Update ' + updateData + ' not allowed')
  }

  promiseChange
    .then((newUser) => {
      // Invoke the hook
      onUserUpdated(newUser, updateData)

      res.status(200).send({
        updated: true,
      })
    })
    .catch((err) => {
      res.status(400).send({
        error: err.message ? err.message : err,
      })
    })
}

export default async (req, res) => {
  const {
    query: { slug },
  } = req

  const userId = slug[0]

  try {
    // Connect to database
    await connect()
  } catch (e) {
    // console.log(e)
    return res.status(500).json({
      message: e.message,
    })
  }

  try {
    await runMiddleware(req, res, hasPermissionsForUser(userId))
  } catch (e) {
    return res.status(401).json({
      message: e.message,
    })
  }

  try {
    await runMiddleware(req, res, userExist(userId))
  } catch (e) {
    // console.log(e)
    return res.status(404).json({
      message: e.message,
    })
  }

  methods(req, res, {
    get: getUser,
    del: delUser,
    put: useFormidable(updateUser(slug)),
  })
}
