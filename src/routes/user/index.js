import {Router} from 'express'
import authRouter from './auth.router'
import userProfileRouter from './profile.router'
import deviceRouter from './device.router'
import borrowRequestRouter from './borrow-request.router' 

const user = Router()

user.use('/auth', authRouter)
user.use('/profile', userProfileRouter)
user.use('/device', deviceRouter)
user.use('/borrow-requests', borrowRequestRouter)

export default user
