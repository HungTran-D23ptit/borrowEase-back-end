import mongoose from 'mongoose'
import {Device, Review, BorrowRequest } from '@/models'
import {abort} from '@/utils/helpers'
import {FileUpload} from '@/utils/classes'
import {LINK_STATIC_URL} from '@/configs'
import dayjs from 'dayjs'

// Thêm thiết bị
export async function createDevice(data, session) {
    try {
        if (data.image_url) {
            data.image_url = await data.image_url.save()
        }

        const device = new Device(data)
        return await device.save({session})
    } catch (error) {
        abort(500, 'Lỗi khi tạo thiết bị')
    }
}

// Cập nhật thiết bị
export async function updateDevice(deviceId, data, session) {
    try {
        const device = await Device.findById(deviceId).session(session)
    
        if (data.image_url) {
            FileUpload.remove(device.image_url)
            data.image_url = await data.image_url.save()
        }

        const updated = await Device.findByIdAndUpdate(deviceId, { $set: data }, { new: true, session })

        return updated
    } catch (error) {
        abort(500, 'Lỗi khi cập nhật thiết bị')
    }
}

// Xoá thiết bị
export async function deleteDevice(deviceId) {
    try {
        const deletedDevice = await Device.findByIdAndDelete(deviceId)
        if (!deletedDevice) {
            abort(404, 'Thiết bị không tồn tại hoặc đã bị xóa')
        }
        return { message: 'Thiết bị đã được xóa thành công.' }
    } catch (error) {
        abort(500, 'Lỗi khi xoá thiết bị')
    }
}

// Đánh dấu thiết bị đang bảo trì
export async function markDeviceAsMaintenance(deviceId, session) {
    try {
        const device = await Device.findById(deviceId).session(session)

        // Nếu đang bảo trì thì không cần cập nhật
        if (device.status === 'MAINTENANCE') {
            return device
        }

        device.status = 'MAINTENANCE'
        await device.save({ session })

        return device
    } catch (error) {
        abort(500, 'Lỗi khi đánh dấu thiết bị bảo trì')
    }
}

// Lấy danh sách thiết bị
export async function getDevices({page = 1, per_page = 10, status, search}) {
    try {
        const query = {deleted: false}
        if (status) query.status = status
        if (search) {
            query.$or = [{name: new RegExp(search, 'i')}, {code: new RegExp(search, 'i')}]
        }

        const total = await Device.countDocuments(query)
        const devices = await Device.find(query)
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({updatedAt: -1})

        const data = devices.map((device) => {
            const deviceObj = device.toObject()
            if (deviceObj.image_url && !deviceObj.image_url.startsWith('https')) {
                deviceObj.image_url = LINK_STATIC_URL + deviceObj.image_url
            }
            return deviceObj
        })

        return {total, page, per_page, data}
    } catch (error) {
        abort(500, 'Lỗi khi lấy danh sách thiết bị')
    }
}

// Lấy chi tiết thiết bị
export async function getDeviceById(deviceId, { page = 1, per_page = 5 } = {}) {
    try {
        const device = await Device.findById(deviceId)

        const deviceObj = device.toObject()

        if (deviceObj.image_url && !deviceObj.image_url.startsWith('https')) {
            deviceObj.image_url = LINK_STATIC_URL + deviceObj.image_url
        }

        // Tổng số đánh giá
        const total = await Review.countDocuments({ device: device._id })

        // Lấy danh sách đánh giá theo trang
        const reviews = await Review.find({ device: device._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * per_page)
            .limit(per_page)
            .populate('user', 'full_name avatar')
            .lean()

        // Tính điểm trung bình đánh giá
        const avgResult = await Review.aggregate([
            { $match: { device: new mongoose.Types.ObjectId(deviceId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                },
            },
        ])
        const avg_rating = avgResult[0]?.avgRating || null

        // Trả về kết quả
        return {
            ...deviceObj,
            avg_rating,
            reviews: {
                total,
                page,
                per_page,
                data: reviews,
            },
        }
    } catch (error) {
        abort(500, 'Lỗi khi lấy chi tiết thiết bị')
    }
}

// Tính tổng tất cả thiết bị
export async function countTotalDevices() {
    try {
        const result = await Device.aggregate([
            {
                $match: { deleted: false }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        // Khởi tạo mặc định
        const stats = {
            total: 0,
            NORMAL: 0,
            MAINTENANCE: 0
        }

        // Gộp kết quả từ aggregation
        for (const item of result) {
            if (item._id === 'NORMAL') stats.NORMAL = item.count
            if (item._id === 'MAINTENANCE') stats.MAINTENANCE = item.count
            stats.total += item.count
        }

        return stats
    } catch (error) {
        abort(500, 'Lỗi khi thống kê tổng thiết bị')
    }
}

// Lấy danh sách thiết bị được mượn nhiều nhất trong tháng
export async function getMostBorrowedDevicesThisMonth({ month, year, limit = 5 }) {
    try {
        const now = dayjs()
        const startOfMonth = dayjs(`${year || now.year()}-${month || now.month() + 1}-01`).startOf('month').toDate()
        const endOfMonth = dayjs(startOfMonth).endOf('month').toDate()

        const result = await BorrowRequest.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                    status: { $in: ['APPROVED', 'RETURNED', 'RETURNING', 'OVERDUE'] }
                }
            },
            {
                $group: {
                    _id: '$device',
                    borrowCount: { $sum: 1 }
                }
            },
            { $sort: { borrowCount: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'devices',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'device'
                }
            },
            { $unwind: '$device' },
            {
                $project: {
                    _id: 0,
                    device_id: '$_id',
                    borrowCount: 1,
                    name: '$device.name',
                    code: '$device.code',
                    image_url: {
                        $cond: [
                            { $regexMatch: { input: '$device.image_url', regex: /^https/ } },
                            '$device.image_url',
                            { $concat: [LINK_STATIC_URL, '$device.image_url'] }
                        ]
                    }
                }
            }
        ])

        return result
    } catch (error) {
        abort(500, 'Lỗi khi thống kê thiết bị mượn nhiều trong tháng')
    }
}


