import * as borrowRequestService from '@/app/services/borrow-request.service'
import * as adminLogService from '@/app/services/admin-action-log.service'
import {db} from '@/configs'

// Duyệt đơn mượn
export async function approveRequest(req, res) {
    await db.transaction(async (session) => {
        const request = await borrowRequestService.approveRequest(req.params.id, session)

        await adminLogService.log(
            req.currentAdmin._id,
            `Duyệt đơn mượn của người dùng ${request.user.name} thiết bị ${request.device.name}`,
            'BorrowRequest',
            req.params.id
        )

        res.json({
            message: 'Duyệt đơn mượn thành công',
        })
    })
}

// Từ chối đơn mượn
export async function rejectRequest(req, res) {
    await db.transaction(async (session) => {
        const request = await borrowRequestService.rejectRequest(req.params.id, req.body.note, session)

        await adminLogService.log(
            req.currentAdmin._id,
            `Từ chối đơn mượn của người dùng ${request.user.name} thiết bị ${request.device.name}`,
            'BorrowRequest',
            req.params.id
        )

        res.json({
            message: 'Từ chối đơn mượn thành công',
        })
    })
}

// Lấy danh sách đơn mượn theo trạng thái
export async function getRequests(req, res) {
    const {status, page = 1, per_page = 10} = req.query
    const result = await borrowRequestService.getRequests({
        status,
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy thiết bị đang mượn
export async function getBorrowingDevices(req, res) {
    const {page = 1, per_page = 10} = req.query
    const result = await borrowRequestService.getBorrowingDevices({
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy thiết bị quá hạn
export async function getOverdueDevices(req, res) {
    const {page = 1, per_page = 10} = req.query
    const result = await borrowRequestService.getOverdueDevices({
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy thiết bị đã trả
export async function getReturnedDevices(req, res) {
    const {user, page = 1, per_page = 10} = req.query
    const result = await borrowRequestService.getReturnedDevices({
        user,
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy chi tiết đơn mượn
export async function getBorrowRequestDetail(req, res) {
    const isAdmin = req.user?.constructor?.modelName === 'Admin'
    const result = await borrowRequestService.getBorrowRequestDetail({
        id: req.params.id,
        user: req.user?._id,
        isAdmin,
    })
    res.jsonify(result)
}

// Xác nhận đã trả thiết bị
export async function confirmReturnDevice(req, res) {
    await db.transaction(async (session) => {
        const borrowRequestId = req.params.id

        const request = await borrowRequestService.confirmReturnDevice(borrowRequestId, session)

        await adminLogService.log(
            req.currentAdmin._id,
            `Xác nhận trả thiết bị ${request.device.name} của người dùng ${request.user.name}`,
            'BorrowRequest',
            borrowRequestId
        )

        res.json({
            message: 'Xác nhận trả thiết bị thành công',
        })
    })
}

// Thống kê đơn theo trạng thái
export async function getBorrowRequestStats(req, res) {
    const result = await borrowRequestService.getBorrowRequestStats()
    res.jsonify(result)
}
