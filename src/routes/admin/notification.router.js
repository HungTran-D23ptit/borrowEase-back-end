import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as notificationController from '@/app/controllers/admin/notification.controller'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'

const notificationRouter = Router()

notificationRouter.get(
    '/',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(notificationController.getNotifications)
)

notificationRouter.get(
    '/unread-count',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(notificationController.getUnreadCount)
)

notificationRouter.patch(
    '/:id/read',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(notificationController.markNotificationAsRead)
)

notificationRouter.patch(
    '/mark-all-read',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(notificationController.markAllRead)
)

notificationRouter.delete(
    '/:id',
    asyncHandler(authMiddleware.checkValidToken),
    asyncHandler(notificationController.deleteNotification)
)

export default notificationRouter
