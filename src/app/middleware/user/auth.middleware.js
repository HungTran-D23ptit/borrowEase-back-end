import {abort, getToken, verifyToken} from '@/utils/helpers'
import _ from 'lodash'
import {tokenBlocklist} from '../../services/auth.service'
import {TOKEN_TYPE} from '@/configs'
import {User} from '@/models'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'

export async function checkValidToken(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
            if (allowedToken) {
                const {userId} = verifyToken(token, TOKEN_TYPE.USER_AUTHORIZATION)
                const user = await User.findOne({_id: userId, deleted: false})
                if (user) {
                    req.currentUser = user
                    next()
                    return
                }
            }
        }
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!')
        }
    }
    abort(401)
}
