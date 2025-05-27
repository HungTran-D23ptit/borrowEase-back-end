import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as deviceController from '@/app/controllers/admin/device.controller'
import * as deviceMiddleware from '@/app/middleware/admin/device.middleware'
import validate from '@/app/middleware/admin/validate'
import * as deviceRequest from '@/app/requests/admin/device.request'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'

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

deviceRouter.post(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(validate(deviceRequest.createDevice)),
    asyncHandler(deviceController.createDevice)
)

deviceRouter.put(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(validate(deviceRequest.updateDevice)),
    asyncHandler(deviceMiddleware.checkDeviceExists),
    asyncHandler(deviceController.updateDevice)
)

deviceRouter.delete(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceMiddleware.checkDeviceExists),
    asyncHandler(deviceController.deleteDevice)
)

deviceRouter.get(
    '/stats/most-borrowed',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceController.getMostBorrowedDevices)
)

deviceRouter.patch(
    '/:id/maintenance',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceMiddleware.checkDeviceExists),
    asyncHandler(deviceController.markDeviceMaintenance)
)

deviceRouter.get(
    '/statistic/total',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceController.getTotalDevices)
)

export default deviceRouter
