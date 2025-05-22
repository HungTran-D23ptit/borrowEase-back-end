import { abort, getToken } from '@/utils/helpers'
import * as authService from '@/app/services/auth.service'
import { db } from '@/configs'

export async function login(req, res) {
    const validLogin = await authService.checkValidLoginUser(req.body)

    if (validLogin) {
        res.jsonify(authService.authTokenUser(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await authService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function register(req, res) {
    let user
    await db.transaction(async function (session) {
        user = await authService.registerUser(req.body, session)
    })
    res.jsonify({
        message: 'Đăng ký tài khoản thành công',
        user
    })
}