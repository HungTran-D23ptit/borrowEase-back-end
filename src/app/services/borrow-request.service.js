import mongoose from 'mongoose'
import { BorrowRequest, Device } from '@/models'
import { abort } from '@/utils/helpers'

// Tạo đơn mượn thiết bị
export async function createBorrowRequest(userId, data, session) {
    const { device: deviceId, quantity, reason, borrow_date, return_date } = data

    if (!deviceId || !quantity || quantity < 1) {
        abort(400, 'Thông tin thiết bị không hợp lệ')
    }

    const device = await Device.findOne({ _id: deviceId, deleted: false }).session(session)
    
    if (device.quantity < quantity) {
        abort(400, `Thiết bị "${device.name}" chỉ còn ${device.quantity} chiếc`)
    }

    // Tạo đơn mượn với trạng thái mặc định là PENDING
    const borrowRequest = await BorrowRequest.create([{
        user: userId,
        device: deviceId,
        quantity,
        reason,
        borrow_date,
        return_date
    }], { session })

    return borrowRequest[0]
}

// Duyệt đơn mượn thiết bị
export async function approveRequest(id) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const request = await BorrowRequest.findById(id).session(session)

        const device = await Device.findById(request.device).session(session)

        if (device.quantity < request.quantity) {
            abort(400, `Thiết bị "${device.name}" không đủ số lượng`)
        }

        device.quantity -= request.quantity
        await device.save({ session })

        request.status = 'APPROVED'
        await request.save({ session })

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

// Từ chối đơn mượn thiết bị
export async function rejectRequest(id, note) {
    const request = await BorrowRequest.findById(id)
    if (!request || request.status !== 'PENDING') {
        abort(400, 'Không thể từ chối đơn')
    }

    request.status = 'REJECTED'
    request.note = note
    await request.save()
}

// Lấy danh sách đơn mượn theo trạng thái 
export async function getRequests({ status, user, page = 1, per_page = 10 } = {}) {
    const filter = {}
    if (status) filter.status = status
    if (user) filter.user = user

    const skip = (page - 1) * per_page
    const limit = per_page

    const [requests, total] = await Promise.all([
        BorrowRequest.find(filter)
            .populate('user device')
            .skip(skip)
            .limit(limit),
        BorrowRequest.countDocuments(filter),
    ])

    return { total, page, per_page, requests }
}

// Lấy các thiết bị đang cho mượn (đơn đã duyệt) 
export async function getBorrowingDevices({ user, page = 1, per_page = 10 } = {}) {
    const filter = { status: 'APPROVED' }
    if (user) filter.user = user

    const skip = (page - 1) * per_page

    const [borrowings, total] = await Promise.all([
        BorrowRequest.find(filter)
            .populate('user device')
            .skip(skip)
            .limit(per_page),
        BorrowRequest.countDocuments(filter),
    ])

    return { total, page, per_page, borrowings }
}

// Lấy các thiết bị đang trả trễ (đơn đã duyệt nhưng return_date < ngày hiện tại) 
export async function getOverdueDevices({ user, page = 1, per_page = 10 } = {}) {
    const filter = {
        status: 'APPROVED',
        return_date: { $lt: new Date() },
    }
    if (user) filter.user = user

    const skip = (page - 1) * per_page

    const [overdue, total] = await Promise.all([
        BorrowRequest.find(filter)
            .populate('user device')
            .skip(skip)
            .limit(per_page),
        BorrowRequest.countDocuments(filter),
    ])

    return { total, page, per_page, overdue }
}

// Lấy các thiết bị đã trả (đơn có trạng thái RETURNED)
export async function getReturnedDevices({ user, page = 1, per_page = 10 } = {}) {
    const filter = { status: 'RETURNED' }
    if (user) filter.user = user

    const skip = (page - 1) * per_page

    const [returned, total] = await Promise.all([
        BorrowRequest.find(filter)
            .populate('user device')
            .skip(skip)
            .limit(per_page),
        BorrowRequest.countDocuments(filter),
    ])

    return { total, page, per_page, returned }
}

// Xem chi tiết một đơn mượn
export async function getBorrowRequestDetail({ id, user, isAdmin = false }) {
    const request = await BorrowRequest.findById(id).populate('user device')

    if (!isAdmin && user && request.user._id.toString() !== user.toString()) {
        abort(403, 'Bạn không có quyền xem đơn này')
    }

    return request
}

// Trả thiết bị
export async function returnDevice(id) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const request = await BorrowRequest.findById(id).session(session)
        if (!request || request.status !== 'APPROVED') {
            abort(400, 'Không thể trả thiết bị')
        }

        const device = await Device.findById(request.device).session(session)
        device.quantity += request.quantity
        await device.save({ session })

        request.status = 'RETURNED'
        request.actual_return_date = new Date()
        await request.save({ session })

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

// Hủy đơn mượn (khi chưa duyệt)
export async function cancelBorrowRequest(id, userId) {
    const request = await BorrowRequest.findById(id)
    if (!request || request.status !== 'PENDING') {
        abort(400, 'Không thể hủy đơn mượn')
    }

    if (request.user.toString() !== userId.toString()) {
        abort(403, 'Không có quyền hủy đơn mượn này')
    }

    request.status = 'CANCELLED'
    await request.save()
}

// Thống kê đơn mượn (số lượng theo từng trạng thái)
export async function getBorrowRequestStats(user) {
    const match = user ? {  user: new mongoose.Types.ObjectId(user) } : {}

    const stats = await BorrowRequest.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ])

    // Đảm bảo đầy đủ tất cả trạng thái
    const defaultStats = {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        RETURNED: 0,
        CANCELLED: 0,
    }

    for (const s of stats) {
        defaultStats[s._id] = s.count
    }

    return defaultStats
}
