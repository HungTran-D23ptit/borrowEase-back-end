import mongoose from 'mongoose'
import { BorrowRequest, Device, Review } from '@/models'
import { abort } from '@/utils/helpers'
import { createApprovedNotification } from '@/app/services/notification.service'

// Tạo đơn mượn thiết bị
export async function createBorrowRequest(userId, data, session) {
    const { device: deviceId, quantity, reason, borrow_date, return_date } = data

    if (!deviceId || !quantity || quantity < 1) {
        abort(400, 'Thông tin thiết bị không hợp lệ')
    }

    const now = new Date()

    // Không cho mượn nếu borrow_date ở quá khứ (tính theo thời điểm hiện tại)
    if (new Date(borrow_date) < now) {
        abort(400, 'Ngày mượn không được ở trong quá khứ hoặc quá giờ hiện tại')
    }

    // Ngày trả phải sau hoặc bằng ngày mượn
    if (new Date(return_date) < new Date(borrow_date)) {
        abort(400, 'Ngày trả phải sau hoặc bằng ngày mượn')
    }

    // Lấy thiết bị và kiểm tra điều kiện
    const device = await Device.findOne({
        _id: deviceId,
        deleted: false,
    }).session(session)

    if (device.status !== 'NORMAL') {
        abort(400, `Thiết bị "${device.name}" đang bảo trì`)
    }

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

        // Populate user + device sau khi save
        const populated = await BorrowRequest.findById(request._id)
            .populate('user device')

        await createApprovedNotification({
            user: populated.user, 
            device: populated.device,
            quantity: request.quantity,
            returnDate: request.return_date,
            borrowRequestId: request._id,
        })

        await session.commitTransaction()
        session.endSession()

        return request
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
    const now = new Date()

    // Cập nhật trạng thái OVERDUE trước khi lấy danh sách
    await BorrowRequest.updateMany(
        {
            status: 'APPROVED',
            return_date: { $lt: now },
        },
        { $set: { status: 'OVERDUE' } }
    )

    const filter = {
        status: 'OVERDUE',
    }

    if (user) {
        filter.user = user
    }

    const skip = (page - 1) * per_page

    const [overdue, total] = await Promise.all([
        BorrowRequest.find(filter)
            .populate('user device')
            .skip(skip)
            .limit(per_page)
            .sort({ return_date: 1 }),
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

// User yêu cầu trả thiết bị
export async function requestReturnDevice(id, userId) {
    const request = await BorrowRequest.findById(id)

    if (!request || !['APPROVED', 'OVERDUE'].includes(request.status)) {
        abort(400, 'Chỉ có thể yêu cầu trả thiết bị khi đơn đang được duyệt hoặc quá hạn')
    }

    // Kiểm tra quyền sở hữu
    if (request.user.toString() !== userId.toString()) {
        abort(403, 'Không có quyền yêu cầu trả thiết bị này')
    }

    request.status = 'RETURNING'
    await request.save()
}

// Admin xác nhận trả thiết bị
export async function confirmReturnDevice(id) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const request = await BorrowRequest.findById(id).session(session)
        if (!request || request.status !== 'RETURNING') {
            abort(400, 'Đơn không phải là đơn đang trả')
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

// Đánh giá thiết bị sau khi mượn
export async function createReview({ userId, requestId, rating, comment }) {
    const request = await BorrowRequest.findOne({
        _id: requestId,
        user: userId,
        status: 'RETURNED',
    })

    if (!request) {
        abort(400, 'Đơn mượn không hợp lệ hoặc chưa trả thiết bị')
    }

    const existingReview = await Review.findOne({ request: requestId })
    if (existingReview) {
        abort(400, 'Đơn mượn này đã được đánh giá trước đó')
    }

    const review = await Review.create({
        user: userId,
        device: request.device,
        request: requestId,
        rating,
        comment,
    })

    return review
}

// Lấy tất cả lịch sử mượn của người dùng (bao gồm đang mượn, đã trả, quá hạn)
export async function getAllBorrowHistory({ user, page = 1, per_page = 10 } = {}) {
    const skip = (page - 1) * per_page

    const [borrowing, returned, overdue, totalReviews] = await Promise.all([
        BorrowRequest.find({ status: 'APPROVED', user })
            .populate('device')
            .sort({ borrow_date: -1 }),

        BorrowRequest.find({ status: 'RETURNED', user })
            .populate('device')
            .sort({ return_date: -1 }),

        BorrowRequest.find({ status: 'OVERDUE', user })
            .populate('device')
            .sort({ return_date: 1 }),

        Review.countDocuments({ user }), // Đếm số lượt đánh giá
    ])

    return {
        borrowing: {
            total: borrowing.length,
            page,
            per_page,
            data: borrowing.slice(skip, skip + per_page),
        },
        returned: {
            total: returned.length,
            page,
            per_page,
            data: returned.slice(skip, skip + per_page),
        },
        overdue: {
            total: overdue.length,
            page,
            per_page,
            data: overdue.slice(skip, skip + per_page),
        },
        total_reviews: totalReviews, 
    }
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
        RETURNING: 0,
        RETURNED: 0,
        OVERDUE: 0,
        CANCELLED: 0,
    }

    for (const s of stats) {
        defaultStats[s._id] = s.count
    }

    return defaultStats
}
