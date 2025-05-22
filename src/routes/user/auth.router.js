import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/user/validate'
import * as authMiddleware from '@/app/middleware/user/auth.middleware'
import * as authRequest from '@/app/requests/user/auth.request'
import * as authController from '@/app/controllers/user/auth.controller'

const authRouter = Router()

authRouter.post(
    '/login',
    asyncHandler(validate(authRequest.login)),
    asyncHandler(authController.login)
)

authRouter.post(
    '/register',
    asyncHandler(validate(authRequest.register)),
    asyncHandler(authController.register)
)

authRouter.post(
    '/logout',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(authController.logout)
)


export default authRouter 