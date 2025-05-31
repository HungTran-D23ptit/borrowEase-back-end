import {Router} from 'express'
import authRouter from './auth.router'
import userProfileRouter from './profile.router'
import deviceRouter from './device.router'
import borrowRequestRouter from './borrow-request.router' 
import notificationRouter from './notification.router' 

const user = Router()

user.use('/auth', authRouter)
user.use('/profile', userProfileRouter)
user.use('/device', deviceRouter)
user.use('/borrow-requests', borrowRequestRouter)
user.use('/notifications', notificationRouter) 

export default user
