import * as borrowRequestService from '@/app/services/borrow-request.service'
import { db } from '@/configs'

// Duyệt đơn mượn
export async function approveRequest(req, res) {
    await db.transaction(async (session) => {
        await borrowRequestService.approveRequest(req.params.id, session)
        res.jsonify({ message: 'Duyệt đơn mượn thành công' })
    })
}

// Từ chối đơn mượn
export async function rejectRequest(req, res) {
    await db.transaction(async (session) => {
        await borrowRequestService.rejectRequest(req.params.id, req.body.note, session)
        res.jsonify({ message: 'Từ chối đơn mượn thành công' })
    })
}

// Lấy danh sách đơn mượn theo trạng thái
export async function getRequests(req, res) {
    const { status, page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getRequests({
        status,
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy thiết bị đang mượn
export async function getBorrowingDevices(req, res) {
    const { page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getBorrowingDevices({
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy thiết bị quá hạn
export async function getOverdueDevices(req, res) {
    const { page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getOverdueDevices({
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy thiết bị đã trả
export async function getReturnedDevices(req, res) {
    const { user, page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getReturnedDevices({
        user,
        page,
        per_page,
    })
    res.jsonify(result)
}

// Lấy chi tiết đơn mượn
export async function getBorrowRequestDetail(req, res) {
    const result = await borrowRequestService.getBorrowRequestDetail(req.params.id)
    res.jsonify(result)
}

// Xác nhận đã trả thiết bị 
export async function confirmReturnDevice(req, res) {
    const borrowRequestId = req.params.id

    await borrowRequestService.confirmReturnDevice(borrowRequestId)

    res.json({ message: 'Xác nhận trả thiết bị thành công' })
}

// Thống kê đơn theo trạng thái
export async function getBorrowRequestStats(req, res) {
    const result = await borrowRequestService.getBorrowRequestStats()
    res.jsonify(result)
}
