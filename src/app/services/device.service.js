import Device from '@/models/device'
import {abort} from '@/utils/helpers'
import {FileUpload} from '@/utils/classes'
import {LINK_STATIC_URL} from '@/configs'

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
export async function getDeviceById(deviceId) {
    try {
        const device = await Device.findById(deviceId)

        const deviceObj = device.toObject()
        if (deviceObj.image_url && !deviceObj.image_url.startsWith('https')) {
            deviceObj.image_url = LINK_STATIC_URL + deviceObj.image_url
        }

        return deviceObj
    } catch (error) {
        abort(500, 'Lỗi khi lấy chi tiết thiết bị')
    }
}
