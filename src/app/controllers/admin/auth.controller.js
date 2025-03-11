import {abort, getToken} from '@/utils/helpers'
import * as authService from '@/app/services/auth.service'

export async function login(req, res) {
    const validLogin = await authService.checkValidLoginAdmin(req.body)

    if (validLogin) {
        res.jsonify(authService.authToken(validLogin))
    } else {
        abort(400, 'Số điện thoại hoặc mật khẩu không đúng.')
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await authService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await authService.profileAdmin(req.currentAdmin)
    res.jsonify(result)
}
