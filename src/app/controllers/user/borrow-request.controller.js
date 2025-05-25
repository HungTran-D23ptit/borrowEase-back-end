import * as borrowRequestService from '@/app/services/borrow-request.service'
import { db } from '@/configs'

// Tạo đơn mượn thiết bị
export async function createBorrowRequest(req, res) {
    let borrowRequest
    await db.transaction(async (session) => {
        const data = {
            ...req.body,          
            device: req.params.id 
        }
        borrowRequest = await borrowRequestService.createBorrowRequest(req.currentUser._id, data, session)
    })

    res.jsonify({
        message: 'Tạo đơn mượn thiết bị thành công',
        request: borrowRequest,
    })
}

// Lấy danh sách đơn mượn theo trạng thái (của user hiện tại)
export async function getRequests(req, res) {
    const { status, page = 1, per_page = 10 } = req.query

    const result = await borrowRequestService.getRequests({
        status,
        user: req.currentUser._id,
        page,
        per_page,
    })

    res.jsonify(result)
}

// Xem chi tiết đơn mượn
export async function getRequestDetail(req, res) {
    const request = await borrowRequestService.getBorrowRequestDetail({
        id: req.params.id,
        user: req.currentUser._id,
    })

    res.json(request)
}

// Hủy đơn mượn (nếu chưa duyệt)
export async function cancelRequest(req, res) {
    await borrowRequestService.cancelBorrowRequest(req.params.id, req.currentUser._id)
    res.json({ message: 'Đã hủy đơn mượn' })
}

// Trả thiết bị
export async function returnDevice(req, res) {
    await borrowRequestService.returnDevice(req.params.id)
    res.json({ message: 'Đã trả thiết bị thành công' })
}

// Danh sách thiết bị đang mượn
export async function getBorrowingDevices(req, res) {
    const { page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getBorrowingDevices({ user: req.currentUser._id, page, per_page })
    res.json(result)
}

// Danh sách thiết bị quá hạn
export async function getOverdueDevices(req, res) {
    const { page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getOverdueDevices({ user: req.currentUser._id, page, per_page })
    res.json(result)
}

// Danh sách thiết bị đã trả
export async function getReturnedDevices(req, res) {
    const { page = 1, per_page = 10 } = req.query
    const result = await borrowRequestService.getReturnedDevices({ user: req.currentUser._id, page, per_page })
    res.json(result)
}

// Thống kê đơn mượn theo trạng thái
export async function getUserBorrowStats(req, res) {
    const stats = await borrowRequestService.getBorrowRequestStats(req.currentUser._id)
    res.json(stats)
}