import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as userController from '@/app/controllers/admin/user.controller'
import * as userMiddleware from '@/app/middleware/admin/user.middleware'
import validate from '@/app/middleware/admin/validate'
import * as userRequest from '@/app/requests/admin/user.request'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'

const userRouter = Router()

userRouter.get(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(userController.getUsers)
)

userRouter.get(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(userMiddleware.checkUserExists),
    asyncHandler(userController.getUserProfile)
)

userRouter.post(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(validate(userRequest.createUser)),
    asyncHandler(userMiddleware.validateUserData),
    asyncHandler(userController.createUser)
)

userRouter.put(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(validate(userRequest.updateUser)),
    asyncHandler(userMiddleware.checkUserExists),
    asyncHandler(userController.updateUser)
)

userRouter.delete(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(userMiddleware.checkUserExists),
    asyncHandler(userController.deleteUser)
)

userRouter.post(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(userMiddleware.checkUserExists),
    asyncHandler(userController.activateUser)
)

userRouter.get(
    '/statistic/total', 
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(userController.getUserStatistics)
)

export default userRouter
