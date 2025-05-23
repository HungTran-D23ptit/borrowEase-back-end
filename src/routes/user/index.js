import {Router} from 'express'
import authRouter from './auth.router'
import userProfileRouter from './profile.router'
import deviceRouter from './device.router'

const user = Router()

user.use('/auth', authRouter)
user.use('/profile', userProfileRouter)
user.use('/device', deviceRouter)
export default user
