import {Router} from 'express'
import authRouter from './auth.router'
import userRouter from './user.router'

const admin = Router()

admin.use('/auth', authRouter)
admin.use('/users', userRouter)

export default admin
