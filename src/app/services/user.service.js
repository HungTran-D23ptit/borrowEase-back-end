import {User, Admin, STATUS_ACCOUNT} from '@/models'
import { abort } from '@/utils/helpers'
import { FileUpload } from '@/utils/classes'
import { LINK_STATIC_URL } from '@/configs'

// Lấy thông tin admin
export async function getAdminProfile(userId) {
    try {
        const user = await Admin.findOne({ _id: userId, deleted: false })

        if(user.avatar && !user.avatar.startsWith('https')) {
            user.avatar = LINK_STATIC_URL + user.avatar
        }

        return user
    } catch (error) {
        abort(500, 'Lỗi khi lấy thông tin người dùng')
    }
}

// Cập nhật thông tin admin
export async function updateAdminProfile(userId, profileData) {
    const user = await Admin.findOne({_id: userId, deleted: false})

    if (profileData.avatar) {
        FileUpload.remove(user.avatar)
        profileData.avatar = await profileData.avatar.save()
        user.avatar = profileData.avatar
    }

    try {
        const updatedUser = await Admin.findByIdAndUpdate(
            userId,
            { $set: profileData },
            { new: true }
        )
        return updatedUser
    } catch (error) {
        abort(500, 'Lỗi khi cập nhật thông tin người dùng')
    }
}

// Lấy thông tin người dùng
export async function getUserProfile(userId) {
    try {
        const user = await User.findOne({ _id: userId, deleted: false })

        if(user.avatar && !user.avatar.startsWith('https')) {
            user.avatar = LINK_STATIC_URL + user.avatar
        }

        return user
    } catch (error) {
        abort(500, 'Lỗi khi lấy thông tin người dùng')
    }
}

// Cập nhật thông tin người dùng
export async function updateUserProfile(userId, profileData) {
    const user = await User.findOne({_id: userId, deleted: false})

    if (profileData.avatar) {
        FileUpload.remove(user.avatar)
        profileData.avatar = await profileData.avatar.save()
        user.avatar = profileData.avatar
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: profileData },
            { new: true }
        )
        return updatedUser
    } catch (error) {
        abort(500, 'Lỗi khi cập nhật thông tin người dùng')
    }
}

// Lấy danh sách người dùng
export async function getUsers({ page = 1, per_page = 10 }) {
    try {
        page = parseInt(page) || 1
        per_page = parseInt(per_page) || 10

        const query = { deleted: false }

        const total = await User.countDocuments(query)
        const users = await User.find(query)
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({ createdAt: -1 }) 

        return {
            total,
            page,
            per_page,
            data: users
        }
    } catch (error) {
        abort(500, 'Lỗi khi lấy danh sách người dùng')
    }
}

// Tạo người dùng mới
export async function createUser(userData, session) {
    try {
        return await new User(userData).save({ session })
    } catch (error) {
        abort(500, 'Lỗi khi tạo người dùng mới')
    }
}

// Khoá tài khoản người dùng
export async function deleteUser(userId, session) {
    try {
        const user = await User.findById(userId).session(session)

        user.status = STATUS_ACCOUNT.DE_ACTIVE
        await user.save({ session })

        return { message: 'Khóa tài khoản người dùng thành công' }
    } catch (error) {
        abort(500, 'Lỗi khi khóa tài khoản người dùng')
    }
}

// Mở khoá tài khoản người dùng
export async function activateUser(userId, session) {
    try {
        const user = await User.findById(userId).session(session)

        user.status = STATUS_ACCOUNT.ACTIVE
        await user.save({ session })

        return { message: 'Mở khóa tài khoản thành công' }
    } catch (error) {
        abort(500, 'Lỗi khi mở khóa tài khoản')
    }
}

