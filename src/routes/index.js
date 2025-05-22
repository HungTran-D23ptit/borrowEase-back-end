import admin from './admin'
import user from './user'

function route(app) {
    app.use('/admin', admin)
    app.use('/user', user)
}

export default route
