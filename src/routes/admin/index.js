import {Router} from 'express'
import authRouter from './auth.router'
import userRouter from './user.router'
import deviceRouter from './device.router'
import adminProfileRouter from './profile.router'

const admin = Router()

admin.use('/auth', authRouter)
admin.use('/users', userRouter)
admin.use('/device', deviceRouter)
admin.use('/profile', adminProfileRouter)

export default admin
