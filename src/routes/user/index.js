import {Router} from 'express'
import authRouter from './auth.router'

const user = Router()

user.use('/auth', authRouter)

export default user
