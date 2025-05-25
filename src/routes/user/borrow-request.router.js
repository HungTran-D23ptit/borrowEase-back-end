import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as borrowRequestController from '@/app/controllers/user/borrow-request.controller'
import * as borrowRequestMiddleware from '@/app/middleware/user/borrow-request.middleware'
import * as authMiddleware from '@/app/middleware/user/auth.middleware'
import * as deviceMiddleware from '@/app/middleware/user/device.middlewrae'
import validate from '@/app/middleware/user/validate'
import * as borrowRequest from '@/app/requests/user/borrow-request.request'

const borrowRequestRouter = Router()

borrowRequestRouter.post(
    '/:id/borrow',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(deviceMiddleware.checkDeviceExists),
    asyncHandler(validate(borrowRequest.createBorrowRequest)),
    asyncHandler(borrowRequestController.createBorrowRequest)
)

borrowRequestRouter.get(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getRequests)
)

borrowRequestRouter.get(
    '/detail/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkBorrowRequestExists),
    asyncHandler(borrowRequestController.getRequestDetail)
)

borrowRequestRouter.delete(
    '/:id/cancel',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkBorrowRequestExists),
    asyncHandler(borrowRequestController.cancelRequest)
)

borrowRequestRouter.patch(
    '/:id/return',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkBorrowRequestExists),
    asyncHandler(borrowRequestController.returnDevice)
)

borrowRequestRouter.get(
    '/borrowing',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getBorrowingDevices)
)

borrowRequestRouter.get(
    '/overdue',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getOverdueDevices)
)

borrowRequestRouter.get(
    '/returned',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getReturnedDevices)
)

borrowRequestRouter.get(
    '/stats',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getUserBorrowStats)
)

export default borrowRequestRouter
