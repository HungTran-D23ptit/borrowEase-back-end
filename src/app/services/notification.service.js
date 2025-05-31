import {Notification} from '@/models'
import {sendRequestApprovedEmail, sendReminderEmail, sendOverdueAlertToAdmins, sendOverdueEmailToUser} from '@/utils/helpers'

// Tạo thông báo "Yêu cầu được duyệt"
export async function createApprovedNotification({ user, device, quantity, returnDate, borrowRequestId }) {
    await Notification.create({
        user_id: user._id,
        title: 'Yêu cầu mượn thiết bị được duyệt',
        message: `Yêu cầu mượn thiết bị ${device.name} (${quantity} chiếc) đã được duyệt.`,
        type: 'APPROVED',
        related_id: borrowRequestId,
        related_type: 'BORROW_REQUEST',
    })

    await sendRequestApprovedEmail(user, device, quantity, returnDate)
}

// Tạo thông báo "Nhắc đến hạn"
export async function createReminderNotification({ user, device, returnDate, borrowRequestId }) {
    await Notification.create({
        user_id: user._id,
        title: 'Nhắc nhở sắp đến hạn trả thiết bị',
        message: `Thiết bị ${device.name} sẽ đến hạn trả vào ngày ${returnDate}.`,
        type: 'REMINDER',
        related_id: borrowRequestId,
        related_type: 'BORROW_REQUEST',
    })

    await sendReminderEmail(user, device, returnDate)
}

// Tạo thông báo "Cảnh báo quá hạn" cho user + gửi mail cho admin
export async function createOverdueNotification({ user, device, returnDate, borrowRequestId, admins }) {
    // 1. Gửi cảnh báo cho user
    await Notification.create({
        user_id: user._id,
        title: 'Cảnh báo quá hạn trả thiết bị',
        message: `Thiết bị ${device.name} đã quá hạn trả từ ngày ${returnDate}.`,
        type: 'OVERDUE',
        related_id: borrowRequestId,
        related_type: 'BORROW_REQUEST',
    })
    
    await sendOverdueEmailToUser(user, device, returnDate)

    // 2. Gửi cảnh báo cho từng admin (cả hệ thống)
    for (const admin of admins) {
        await Notification.create({
            user_id: admin._id,
            title: `Thiết bị quá hạn từ sinh viên ${user.name}`,
            message: `Thiết bị ${device.name} mượn bởi ${user.name} đã quá hạn trả từ ngày ${returnDate}.`,
            type: 'OVERDUE',
            related_id: borrowRequestId,
            related_type: 'BORROW_REQUEST',
        })
    }

    await sendOverdueAlertToAdmins(admins, user, device, returnDate)
}

// Lấy danh sách thông báo 
export async function getNotifications(userId, { page = 1, per_page = 10 } = {}) {
    const skip = (page - 1) * per_page
    return {
        total: await Notification.countDocuments({ user_id: userId, deleted: false }),
        page, per_page,
        notifications: await Notification.find({ user_id: userId, deleted: false })
            .sort({ createdAt: -1 }).skip(skip).limit(per_page),
    }
}

// Đếm thông báo chưa đọc
export async function countUnread(userId) {
    return await Notification.countDocuments({ user_id: userId, is_read: false, deleted: false })
}

// Đánh dấu đã đọc
export async function markAsRead(userId, notificationId) {
    const notification = await Notification.findOne({
        _id: notificationId,
        user_id: userId,
        deleted: false,
    })

    if (!notification) {
        const error = new Error('Thông báo không tồn tại hoặc không thuộc về bạn')
        error.statusCode = 404
        throw error
    }

    if (notification.is_read) {
        return {
            updated: false,
            message: 'Thông báo đã được đánh dấu là đã đọc từ trước',
            notification,
        }
    }

    notification.is_read = true
    await notification.save()

    return {
        updated: true,
        message: 'Đã đánh dấu là đã đọc',
        notification,
    }
}

// Đánh dấu tất cả đã đọc
export async function markAllAsRead(userId) {
    // Kiểm tra xem có thông báo nào chưa đọc không
    const unreadCount = await Notification.countDocuments({
        user_id: userId,
        is_read: false,
        deleted: false,
    })

    if (unreadCount === 0) {
        return { updated: 0, message: 'Tất cả thông báo đã được đánh dấu là đã đọc từ trước' }
    }

    const result = await Notification.updateMany(
        { user_id: userId, is_read: false, deleted: false },
        { is_read: true }
    )

    return { updated: result.modifiedCount || result.nModified || 0, message: 'Đã đánh dấu tất cả là đã đọc' }
}

// Xoá 1 thông báo
export async function deleteNotification(userId, notificationId) {
    const notification = await Notification.findOne({
        _id: notificationId,
        user_id: userId,
        deleted: false,
    })

    if (!notification) {
        const error = new Error('Không tìm thấy thông báo để xoá')
        error.statusCode = 404
        throw error
    }

    notification.deleted = true
    await notification.save()

    return {
        message: 'Đã ẩn thông báo',
        notification
    }
}
