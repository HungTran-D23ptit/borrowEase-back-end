import * as deviceService from '@/app/services/device.service'
import { db } from '@/configs'

export async function getDevices(req, res) {
    const { page = 1, per_page = 10, status, search } = req.query
    const result = await deviceService.getDevices({ page, per_page, status, search })
    res.json(result)
}

export async function getDeviceById(req, res) {
    const device = await deviceService.getDeviceById(req.params.id)
    res.json(device)
}

export async function createDevice(req, res) {
    await db.transaction(async (session) => {
        const device = await deviceService.createDevice(req.body, session)
        res.status(201).json({
            message: 'Thiết bị đã được tạo thành công.',
            data: device,
        })
    })
}

export async function updateDevice(req, res) {
    await db.transaction(async (session) => {
        const updated = await deviceService.updateDevice(req.params.id, req.body, session)
        res.json({
            message: 'Cập nhật thiết bị thành công.',
            data: updated,
        })
    })
}

export async function deleteDevice(req, res) {
    await db.transaction(async (session) => {
        const result = await deviceService.deleteDevice(req.params.id, session)
        res.json(result)
    })
}
