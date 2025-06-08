import { AdminActionLog } from '@/models'
import { abort } from '@/utils/helpers'

// Ghi lại lịch sử hoạt động của admin
export async function log(adminId, action, targetType, targetId) {
    try {
        const logEntry = new AdminActionLog({
            admin_id: adminId,
            action,
            target_type: targetType,
            target_id: targetId,
        })
        await logEntry.save()
        return logEntry
    } catch (error) {
        abort(500, 'Lỗi khi ghi lịch sử hoạt động của admin')
    }
}

// Lấy danh sách lịch sử hoạt động của admin, phân trang
export async function getAdminActionLogs(page = 1, perPage = 20) {
    try {
        const skip = (page - 1) * perPage

        const [total, data] = await Promise.all([
            AdminActionLog.countDocuments(),
            AdminActionLog.find()
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(perPage)
                .populate('admin_id', 'name email')
                .lean(),
        ])

        return {
            data,
            total,
        }
    } catch (error) {
        abort(500, 'Lỗi khi lấy lịch sử hoạt động của admin')
    }
}
