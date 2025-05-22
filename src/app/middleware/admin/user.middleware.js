import { User } from '@/models'
import { abort } from '@/utils/helpers'

export async function validateUserData(req, res, next) {
    const { email} = req.body

    if (!email) abort(400, 'Email là bắt buộc')

    if (email) {
        const existingEmail = await User.findOne({ email })
        if (existingEmail) abort(400, 'Email đã tồn tại')
    }

    next()
}

export async function checkUserExists(req, res, next) {
    const user = await User.findById(req.params.id)
    if (!user || user.deleted) abort(404, 'Người dùng không tồn tại')

    req.user = user 
    next()
}
