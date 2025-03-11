import {Router} from 'express'
import authRouter from './auth.router'
import roleRouter from './role.router'

const admin = Router()

admin.use('/auth', authRouter)
admin.use('/roles', roleRouter)

export default admin
