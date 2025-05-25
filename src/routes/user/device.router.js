import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as deviceController from '@/app/controllers/user/device.controller'
import * as deviceMiddleware from '@/app/middleware/user/device.middlewrae'
import * as authMiddleware from '@/app/middleware/user/auth.middleware'

const deviceRouter = Router()

deviceRouter.get(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceController.getDevices)
)

deviceRouter.get(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceMiddleware.checkDeviceExists),
    asyncHandler(deviceController.getDeviceById)
)

export default deviceRouter
