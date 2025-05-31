import { Router } from 'express'
import authRouter from './auth.router'
import userRouter from './user.router'
import deviceRouter from './device.router'
import adminProfileRouter from './profile.router'
import borrowRequestRouter from './borrow-request.router' 
import notificationRouter from './notification.router'

const admin = Router()

admin.use('/auth', authRouter)
admin.use('/users', userRouter)
admin.use('/device', deviceRouter)
admin.use('/profile', adminProfileRouter)
admin.use('/borrow-requests', borrowRequestRouter)
admin.use('/notifications', notificationRouter) 

export default admin
