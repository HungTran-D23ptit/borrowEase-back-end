import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as adminActionLogController from '@/app/controllers/admin/admin-action-log.controller'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'

const adminActionLogRouter = Router()

adminActionLogRouter.get(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(adminActionLogController.getAdminActionLogs)
)

export default adminActionLogRouter
