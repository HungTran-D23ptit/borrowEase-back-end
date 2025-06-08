import * as adminActionLogService from '@/app/services/admin-action-log.service'

export async function getAdminActionLogs(req, res) {
    const {page = 1, per_page = 20} = req.query

    const result = await adminActionLogService.getAdminActionLogs(Number(page), Number(per_page))

    res.jsonify({
        message: 'Lấy lịch sử hoạt động của admin thành công.',
        ...result,
    })
}
