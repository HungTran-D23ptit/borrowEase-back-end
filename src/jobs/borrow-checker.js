import { Admin, BorrowRequest } from '@/models'
import {
    createReminderNotification,
    createOverdueNotification,
} from '@/app/services/notification.service'
import { sendOverdueEmailToUser } from '@/utils/helpers' 

export async function runBorrowCheckerJob() {
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)

    const todayStr = now.toISOString().split('T')[0]
    console.log(`[${todayStr}] ⚙️ Running borrow checker job...`)

    // 1. Lấy tất cả yêu cầu mượn đang còn hiệu lực hoặc quá hạn
    const activeRequests = await BorrowRequest.find({
        status: { $in: ['APPROVED', 'OVERDUE'] },
    }).populate('user device')

    if (!activeRequests.length) {
        console.log('✅ Không có yêu cầu đang mượn.')
        return
    }

    // 2. Lấy danh sách admin đang hoạt động (chưa xoá và status ACTIVE)
    const admins = await Admin.find({ deleted: false, status: 'ACTIVE' })
    console.log(`📦 Tổng số yêu cầu cần xử lý: ${activeRequests.length}`)

    for (const request of activeRequests) {
        const returnDate = new Date(request.return_date)
        const user = request.user
        const device = request.device

        if (!user || !device) {
            console.warn(`⚠️ Thiếu user/device cho request ${request._id}`)
            continue
        }

        const isTomorrow = isSameDay(returnDate, tomorrow)

        // Gửi nhắc nhở sắp đến hạn
        if (isTomorrow && request.status !== 'OVERDUE') {
            console.log(`🔔 Nhắc nhở: ${user.name} cần trả ${device.name} vào ${formatDateVN(returnDate)}`)
            await createReminderNotification({
                user,
                device,
                returnDate: request.return_date,
                borrowRequestId: request._id,
            })
        }

        // Gửi cảnh báo nếu đơn đã được đánh dấu là OVERDUE
        if (request.status === 'OVERDUE') {
            const lastNotified = request.notified_overdue_at || new Date(0)
            const daysSinceLastNotify = (now - lastNotified) / (1000 * 60 * 60 * 24)
            const count = request.overdue_notify_count || 0

            if (daysSinceLastNotify >= 3 && count < 3) {
                console.log(`⛔ Gửi cảnh báo quá hạn (${count + 1}/3): ${user.name} - ${device.name}`)

                await createOverdueNotification({
                    user,
                    device,
                    returnDate: request.return_date,
                    borrowRequestId: request._id,
                    admins,
                })

                await sendOverdueEmailToUser(user, device, returnDate)

                request.notified_overdue_at = now
                request.overdue_notify_count = count + 1
                await request.save()
            } else {
                console.log(`↪️ Bỏ qua cảnh báo: ${user.name} - đã gửi ${count}/3 lần, gần nhất ${formatDateVN(lastNotified)}`)
            }
        }
    }

    console.log('✅ Borrow checker job hoàn tất.')
}

// So sánh 2 ngày 
function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

function formatDateVN(date) {
    return `${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })} ${date.toLocaleDateString('vi-VN')}`
}
