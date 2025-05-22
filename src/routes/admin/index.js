import {Router} from 'express'
import authRouter from './auth.router'

const admin = Router()

admin.use('/auth', authRouter)


export default admin
