import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/admin/validate'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import * as authRequest from '@/app/requests/admin/auth.request'
import * as authController from '@/app/controllers/admin/auth.controller'

const authRouter = Router()

authRouter.post(
    '/login',
    asyncHandler(validate(authRequest.login)),
    asyncHandler(authController.login)
)

authRouter.post(
    '/logout',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(authController.logout)
)

authRouter.get(
    '/me',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(authController.me)
)

export default authRouter
