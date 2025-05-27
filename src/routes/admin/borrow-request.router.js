import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as borrowRequestController from '@/app/controllers/admin/borrow-request.controller'
import * as borrowRequestMiddleware from '@/app/middleware/admin/borrow-request.middleware'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import validate from '@/app/middleware/admin/validate'
import * as borrowRequestValidator from '@/app/requests/admin/borrow-request.request'

const borrowRequestRouter = Router()

borrowRequestRouter.get(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getRequests)
)

borrowRequestRouter.patch(
    '/:id/approve',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkBorrowRequestExists),
    asyncHandler(borrowRequestMiddleware.checkCanApproveRequest),
    asyncHandler(borrowRequestController.approveRequest)
)

borrowRequestRouter.patch(
    '/:id/reject',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkBorrowRequestExists),
    asyncHandler(borrowRequestMiddleware.checkCanApproveRequest),
    asyncHandler(validate(borrowRequestValidator.rejectRequest)),
    asyncHandler(borrowRequestController.rejectRequest)
)

borrowRequestRouter.get(
    '/approved',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getBorrowingDevices)
)

borrowRequestRouter.get(
    '/overdue',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getOverdueDevices)
)

borrowRequestRouter.patch(
    '/:id/confirm-return', 
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkReturnRequestExists),
    asyncHandler(borrowRequestController.confirmReturnDevice)
)

borrowRequestRouter.get(
    '/returned',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getReturnedDevices)
)

borrowRequestRouter.get(
    '/stats',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestController.getBorrowRequestStats)
)

borrowRequestRouter.get(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(borrowRequestMiddleware.checkBorrowRequestExists),
    asyncHandler(borrowRequestController.getBorrowRequestDetail)
)
export default borrowRequestRouter
