import authRouter from './auth.router'
import admin from './admin'

function route(app) {
    app.use('/admin', admin)
    app.use('/auth', authRouter)
}

export default route
