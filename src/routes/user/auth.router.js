import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/user/validate'
import * as authMiddleware from '@/app/middleware/user/auth.middleware'
import * as authRequest from '@/app/requests/user/auth.request'
import * as authController from '@/app/controllers/user/auth.controller'
import * as throttleMiddleware from '@/app/middleware/common/throttle.middleware'

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

authRouter.post(
    '/login/google',
    asyncHandler(validate(authRequest.loginGoogle)),
    asyncHandler(authController.loginWithGoogle)
)

authRouter.put(
    '/change-password',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(authController.changePassword)
)

authRouter.post(
    '/forgot-password',
    validate(authRequest.forgotPassword),
    asyncHandler(throttleMiddleware.limitOtpSend),
    asyncHandler(authController.forgotPassword)
)

authRouter.post(
    '/reset-password',
    validate(authRequest.resetPassword),
    asyncHandler(authController.resetPassword)
)

export default authRouter 